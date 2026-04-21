import path from "path";

import {
	type FileTreeItem,
	type ShowcaseEntry,
	type ShowcaseTreeResponse,
} from "@shared/showcase";

import { writeJson } from "./artifacts";
import {
	HTML_EXTENSIONS,
	JS_EXTENSIONS,
	componentsRoot,
	distManifestPath,
	distTreePath,
	htmlComponentsRoot,
	htmlPagesRoot,
	pagesJsxRoot,
	toPosix,
} from "./paths";
import { type ScannedFile, scanDirectory, scanDirectories } from "./scan";

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

export async function generateManifest(): Promise<ShowcaseEntry[]> {
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

	return [...jsxPages, ...components, ...htmlComponents, ...htmlPages].map(
		(file) => ({
			id: file.id,
			name: file.name,
			kind: file.kind,
			format: file.format,
			sourcePath: file.sourcePath,
			moduleKey: file.moduleKey,
			publicUrl: file.publicUrl,
			lastModified: file.lastModified,
		})
	);
}

export async function generateTree(): Promise<ShowcaseTreeResponse> {
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
	};
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
