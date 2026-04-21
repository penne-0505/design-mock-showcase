import fs from "fs/promises";
import path from "path";

import { type ShowcaseFormat } from "@shared/showcase";

import { badRequestError, conflictError } from "./errors";
import {
	ALLOWED_EXTENSIONS,
	componentsRoot,
	ensureFileExists,
	pagesJsxRoot,
	pathExists,
	resolveShowcasePath,
	showcaseRoot,
	toPosix,
	workspaceRoot,
} from "./paths";

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
