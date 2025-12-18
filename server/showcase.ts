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
const ALLOWED_EXTENSIONS = new Set([...JS_EXTENSIONS, ...HTML_EXTENSIONS]);

// NOTE: Rely on process.cwd() so it works in both tsx (ESM) and bundled CJS.
const workspaceRoot = process.cwd();
const showcaseRoot = path.join(workspaceRoot, "showcase");
const pagesJsxRoot = path.join(showcaseRoot, "pages");
const componentsRoot = path.join(showcaseRoot, "components");
const htmlPagesRoot = path.join(showcaseRoot, "pages");
const htmlComponentsRoot = path.join(showcaseRoot, "components");

const distPublicRoot = path.join(workspaceRoot, "dist", "public");
const distTreePath = path.join(distPublicRoot, "showcase-tree.json");
const distManifestPath = path.join(distPublicRoot, "showcase-manifest.json");

function notFoundError(message: string) {
	const err = new Error(message);
	(err as any).status = 404;
	(err as any).statusCode = 404;
	return err;
}

function badRequestError(message: string) {
	const err = new Error(message);
	(err as any).status = 400;
	(err as any).statusCode = 400;
	return err;
}

function conflictError(message: string) {
	const err = new Error(message);
	(err as any).status = 409;
	(err as any).statusCode = 409;
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

interface ScanDirectoriesOptions {
	baseDir: string;
}

function toPosix(p: string): string {
	return p.replace(/\\/g, "/");
}

function resolveShowcasePath(relativePath: string): string {
	if (!relativePath || typeof relativePath !== "string") {
		throw badRequestError("Path is required.");
	}
	const resolved = path.resolve(workspaceRoot, relativePath);
	const showcaseRootWithSep = `${showcaseRoot}${path.sep}`;
	if (!(resolved === showcaseRoot || resolved.startsWith(showcaseRootWithSep))) {
		throw badRequestError("Path must be within the showcase directory.");
	}
	return resolved;
}

async function pathExists(target: string) {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
}

async function ensureFileExists(filePath: string) {
	try {
		const stats = await fs.stat(filePath);
		if (!stats.isFile()) {
			throw badRequestError("Only files can be modified.");
		}
	} catch (error) {
		const status = (error as any)?.status ?? (error as any)?.statusCode;
		if (status === 400) {
			throw error;
		}
		throw notFoundError("File not found.");
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

async function scanDirectories(
	options: ScanDirectoriesOptions
): Promise<string[]> {
	const { baseDir } = options;
	const directories: string[] = [];

	if (!(await pathExists(baseDir))) {
		return directories;
	}

	const stack: string[] = [baseDir];

	while (stack.length) {
		const current = stack.pop()!;
		const dirents = await fs.readdir(current, { withFileTypes: true });

		for (const dirent of dirents) {
			if (!dirent.isDirectory() || dirent.name.startsWith(".")) continue;

			const fullPath = path.join(current, dirent.name);
			const relativePath = toPosix(path.relative(baseDir, fullPath));
			if (relativePath) {
				directories.push(relativePath);
			}
			stack.push(fullPath);
		}
	}

	return directories.sort((a, b) => a.localeCompare(b));
}

function buildTree(
	files: ScannedFile[],
	directories: string[] = [],
	directoryBase?: string
): FileTreeItem[] {
	const root: FileTreeItem[] = [];

	if (directories.length && directoryBase) {
		for (const relativePath of directories) {
			const segments = relativePath.split("/").filter(Boolean);
			let currentLevel = root;
			let folderPath = directoryBase;

			for (const segment of segments) {
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
			}
		}
	}

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
		sourceBase: path.join("showcase", "pages"),
		kind: "page",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "../../../showcase/pages",
	});

	const components = await scanDirectory({
		baseDir: componentsRoot,
		sourceBase: path.join("showcase", "components"),
		kind: "component",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "../../../showcase/components",
	});

	const htmlComponents = await scanDirectory({
		baseDir: htmlComponentsRoot,
		sourceBase: path.join("showcase", "components"),
		kind: "component",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/components",
	});

	const htmlPages = await scanDirectory({
		baseDir: htmlPagesRoot,
		sourceBase: path.join("showcase", "pages"),
		kind: "page",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/pages",
	});

	return [...jsxPages, ...components, ...htmlComponents, ...htmlPages].map((file) => ({
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
		sourceBase: path.join("showcase", "pages"),
		kind: "page",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "../../../showcase/pages",
	});

	const htmlPages = await scanDirectory({
		baseDir: htmlPagesRoot,
		sourceBase: path.join("showcase", "pages"),
		kind: "page",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/pages",
	});

	const pagesDirectories = await scanDirectories({ baseDir: pagesJsxRoot });

	const components = await scanDirectory({
		baseDir: componentsRoot,
		sourceBase: path.join("showcase", "components"),
		kind: "component",
		allowedExtensions: JS_EXTENSIONS,
		moduleKeyPrefix: "../../../showcase/components",
	});

	const htmlComponents = await scanDirectory({
		baseDir: htmlComponentsRoot,
		sourceBase: path.join("showcase", "components"),
		kind: "component",
		allowedExtensions: HTML_EXTENSIONS,
		publicUrlPrefix: "/showcase/components",
	});

	const componentsDirectories = await scanDirectories({
		baseDir: componentsRoot,
	});

	return {
		pages: buildTree(
			[...jsxPages, ...htmlPages],
			pagesDirectories,
			toPosix(path.join("showcase", "pages"))
		),
		components: buildTree(
			[...components, ...htmlComponents],
			componentsDirectories,
			toPosix(path.join("showcase", "components"))
		),
		htmlPages: [],
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

export async function renameShowcaseFile(input: {
	path: string;
	newName: string;
}): Promise<{
	previousPath: string;
	newPath: string;
	name: string;
	format: ShowcaseFormat;
}> {
	const sourcePath = resolveShowcasePath(input.path);
	await ensureFileExists(sourcePath);

	const trimmedName = input.newName?.trim();
	if (!trimmedName) {
		throw badRequestError("New name is required.");
	}
	if (trimmedName.includes("/") || trimmedName.includes("\\")) {
		throw badRequestError("New name must be a file name.");
	}

	const currentExt = path.extname(sourcePath);
	let finalName = trimmedName;
	if (!path.extname(trimmedName)) {
		finalName = `${trimmedName}${currentExt}`;
	}
	const finalExt = path.extname(finalName);
	if (!ALLOWED_EXTENSIONS.has(finalExt)) {
		throw badRequestError("Unsupported file extension.");
	}

	const targetPath = path.resolve(path.dirname(sourcePath), finalName);
	const showcaseRootWithSep = `${showcaseRoot}${path.sep}`;
	if (!(targetPath === showcaseRoot || targetPath.startsWith(showcaseRootWithSep))) {
		throw badRequestError("Target must be within the showcase directory.");
	}
	if (await pathExists(targetPath)) {
		throw conflictError("A file with the new name already exists.");
	}

	await fs.rename(sourcePath, targetPath);

	const newRelativePath = toPosix(path.relative(workspaceRoot, targetPath));
	const format = finalExt.replace(".", "") as ShowcaseFormat;
	return {
		previousPath: toPosix(input.path),
		newPath: newRelativePath,
		name: path.basename(finalName, finalExt),
		format,
	};
}

export async function deleteShowcaseFile(inputPath: string): Promise<{
	deletedPath: string;
}> {
	const targetPath = resolveShowcasePath(inputPath);
	await ensureFileExists(targetPath);
	await fs.unlink(targetPath);
	return { deletedPath: toPosix(inputPath) };
}

export async function createShowcaseDirectory(input: {
	base: "pages" | "components";
	name: string;
}): Promise<{ createdPath: string }> {
	const trimmedName = input.name?.trim();
	if (!trimmedName) {
		throw badRequestError("Directory name is required.");
	}

	const baseRoot =
		input.base === "pages"
			? pagesJsxRoot
			: input.base === "components"
				? componentsRoot
				: null;

	if (!baseRoot) {
		throw badRequestError("Invalid directory base.");
	}

	const targetPath = path.resolve(baseRoot, trimmedName);
	const baseRootWithSep = `${baseRoot}${path.sep}`;
	if (!(targetPath === baseRoot || targetPath.startsWith(baseRootWithSep))) {
		throw badRequestError("Directory must be within the showcase directory.");
	}

	if (await pathExists(targetPath)) {
		const stats = await fs.stat(targetPath);
		if (stats.isDirectory()) {
			throw conflictError("Directory already exists.");
		}
		throw conflictError("A file with the same name already exists.");
	}

	await fs.mkdir(targetPath, { recursive: true });

	return {
		createdPath: toPosix(path.relative(workspaceRoot, targetPath)),
	};
}

export async function moveShowcaseFile(input: {
	path: string;
	targetDir: string;
}): Promise<{
	previousPath: string;
	newPath: string;
	name: string;
	format: ShowcaseFormat;
}> {
	const sourcePath = resolveShowcasePath(input.path);
	await ensureFileExists(sourcePath);

	const targetDirPath = resolveShowcasePath(input.targetDir);
	const targetStats = await fs.stat(targetDirPath);
	if (!targetStats.isDirectory()) {
		throw badRequestError("Target must be a directory.");
	}

	const fileName = path.basename(sourcePath);
	const targetPath = path.resolve(targetDirPath, fileName);
	const showcaseRootWithSep = `${showcaseRoot}${path.sep}`;
	if (!(targetPath === showcaseRoot || targetPath.startsWith(showcaseRootWithSep))) {
		throw badRequestError("Target must be within the showcase directory.");
	}

	const sourceDir = path.dirname(sourcePath);
	if (sourceDir === targetDirPath) {
		throw badRequestError("File is already in that directory.");
	}

	if (await pathExists(targetPath)) {
		throw conflictError("A file with the same name already exists.");
	}

	await fs.rename(sourcePath, targetPath);

	const newRelativePath = toPosix(path.relative(workspaceRoot, targetPath));
	const ext = path.extname(targetPath);
	const format = ext.replace(".", "") as ShowcaseFormat;
	return {
		previousPath: toPosix(input.path),
		newPath: newRelativePath,
		name: path.basename(fileName, ext),
		format,
	};
}
