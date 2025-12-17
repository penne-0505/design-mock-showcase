import fs from "fs/promises";
import path from "path";
import {
	ShowcaseEntry,
	FileTreeItem,
	ShowcaseTreeResponse,
	ShowcaseFormat,
	ShowcaseKind,
} from "@shared/showcase";

const JS_EXTENSIONS = new Set([".jsx", ".tsx"]);
const HTML_EXTENSIONS = new Set([".html"]);

// NOTE: Rely on process.cwd() so it works in both tsx (ESM) and bundled CJS.
const workspaceRoot = process.cwd();
const clientRoot = path.join(workspaceRoot, "client");
const srcShowcaseRoot = path.join(clientRoot, "src", "showcase");
const pagesJsxRoot = path.join(srcShowcaseRoot, "pages");
const componentsRoot = path.join(srcShowcaseRoot, "components");
const htmlPagesRoot = path.join(clientRoot, "public", "showcase", "pages");

const distPublicRoot = path.join(workspaceRoot, "dist", "public");
const distTreePath = path.join(distPublicRoot, "showcase-tree.json");
const distManifestPath = path.join(distPublicRoot, "showcase-manifest.json");

function notFoundError(message: string) {
	const err = new Error(message);
	(err as any).status = 404;
	(err as any).statusCode = 404;
	return err;
}

interface ScannedFile {
	id: string;
	name: string;
	kind: ShowcaseKind;
	format: ShowcaseFormat;
	relativePath: string;
	sourceBase: string;
	sourcePath: string;
	lastModified?: string;
	moduleKey?: string;
	publicUrl?: string;
}

function toPosix(p: string): string {
	return p.replace(/\\/g, "/");
}

async function pathExists(target: string) {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
}

async function scanDirectory(options: {
	baseDir: string;
	sourceBase: string;
	kind: ShowcaseKind;
	allowedExtensions: Set<string>;
	moduleKeyPrefix?: string;
	publicUrlPrefix?: string;
}): Promise<ScannedFile[]> {
	const {
		baseDir,
		sourceBase,
		kind,
		allowedExtensions,
		moduleKeyPrefix,
		publicUrlPrefix,
	} = options;
	const files: ScannedFile[] = [];

	if (!(await pathExists(baseDir))) {
		return files;
	}

	const stack: string[] = [baseDir];

	while (stack.length) {
		const current = stack.pop()!;
		const dirents = await fs.readdir(current, { withFileTypes: true });

		for (const dirent of dirents) {
			if (dirent.name.startsWith(".")) continue;

			const fullPath = path.join(current, dirent.name);
			if (dirent.isDirectory()) {
				stack.push(fullPath);
				continue;
			}

			const ext = path.extname(dirent.name);
			if (!allowedExtensions.has(ext)) continue;

			const stats = await fs.stat(fullPath);
			const relativePath = toPosix(path.relative(baseDir, fullPath));
			const sourcePath = toPosix(path.join(sourceBase, relativePath));
			const format: ShowcaseFormat = ext.replace(".", "") as ShowcaseFormat;
			const moduleKey = moduleKeyPrefix
				? toPosix(path.posix.join(moduleKeyPrefix, relativePath))
				: undefined;
			const publicUrl = publicUrlPrefix
				? toPosix(path.posix.join(publicUrlPrefix, relativePath))
				: undefined;

			files.push({
				id: sourcePath,
				name: path.basename(dirent.name, ext),
				kind,
				format,
				relativePath,
				sourceBase: toPosix(sourceBase),
				sourcePath,
				lastModified: stats.mtime.toISOString(),
				moduleKey,
				publicUrl,
			});
		}
	}

	return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function buildTree(files: ScannedFile[]): FileTreeItem[] {
	const root: FileTreeItem[] = [];

	for (const file of files) {
		const segments = file.relativePath.split("/");
		let currentLevel = root;
		let folderPath = file.sourceBase;

		segments.forEach((segment, index) => {
			const isFile = index === segments.length - 1;

			if (isFile) {
				currentLevel.push({
					id: file.id,
					name: file.name,
					type: "file",
					path: file.sourcePath,
					format: file.format,
					kind: file.kind,
					lastModified: file.lastModified,
				});
				return;
			}

			folderPath = `${folderPath}/${segment}`;
			let folder = currentLevel.find(
				(item) => item.type === "folder" && item.name === segment
			);

			if (!folder) {
				folder = {
					id: folderPath,
					name: segment,
					type: "folder",
					path: folderPath,
					children: [],
				};
				currentLevel.push(folder);
			}

			if (!folder.children) folder.children = [];
			currentLevel = folder.children;
		});
	}

	return root;
}

async function generateManifest(): Promise<ShowcaseEntry[]> {
	const jsxPages = await scanDirectory({
		baseDir: pagesJsxRoot,
		sourceBase: path.join("client", "src", "showcase", "pages"),
		kind: "page",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "/src/showcase/pages",
	});

	const components = await scanDirectory({
		baseDir: componentsRoot,
		sourceBase: path.join("client", "src", "showcase", "components"),
		kind: "component",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "/src/showcase/components",
	});

	const htmlPages = await scanDirectory({
		baseDir: htmlPagesRoot,
		sourceBase: path.join("client", "public", "showcase", "pages"),
		kind: "page",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/pages",
	});

	return [...jsxPages, ...components, ...htmlPages].map((file) => ({
		id: file.id,
		name: file.name,
		kind: file.kind,
		format: file.format,
		sourcePath: file.sourcePath,
		moduleKey: file.moduleKey,
		publicUrl: file.publicUrl,
		lastModified: file.lastModified,
	}));
}

async function generateTree(): Promise<ShowcaseTreeResponse> {
	const jsxPages = await scanDirectory({
		baseDir: pagesJsxRoot,
		sourceBase: path.join("client", "src", "showcase", "pages"),
		kind: "page",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "/src/showcase/pages",
	});

	const components = await scanDirectory({
		baseDir: componentsRoot,
		sourceBase: path.join("client", "src", "showcase", "components"),
		kind: "component",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "/src/showcase/components",
	});

	const htmlPages = await scanDirectory({
		baseDir: htmlPagesRoot,
		sourceBase: path.join("client", "public", "showcase", "pages"),
		kind: "page",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/pages",
	});

	return {
		pages: buildTree(jsxPages),
		components: buildTree(components),
		htmlPages: buildTree(htmlPages),
	};
}

async function loadDistJson<T>(filePath: string): Promise<T | null> {
	if (!(await pathExists(filePath))) return null;
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function writeShowcaseArtifacts(): Promise<void> {
	const [manifest, tree] = await Promise.all([
		generateManifest(),
		generateTree(),
	]);
	await Promise.all([
		writeJson(distManifestPath, manifest),
		writeJson(distTreePath, tree),
	]);
}

export async function getShowcaseManifest(): Promise<ShowcaseEntry[]> {
	if (process.env.NODE_ENV === "production") {
		const distManifest = await loadDistJson<ShowcaseEntry[]>(distManifestPath);
		if (!distManifest) {
			throw notFoundError(
				`Showcase manifest not found. Expected at ${distManifestPath}. Generate via build.`
			);
		}
		return distManifest;
	}

	return generateManifest();
}

export async function getShowcaseTree(): Promise<ShowcaseTreeResponse> {
	if (process.env.NODE_ENV === "production") {
		const distTree = await loadDistJson<ShowcaseTreeResponse>(distTreePath);
		if (!distTree) {
			throw notFoundError(
				`Showcase tree not found. Expected at ${distTreePath}. Generate via build.`
			);
		}
		return distTree;
	}

	return generateTree();
}
