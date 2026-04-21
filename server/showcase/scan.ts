import fs from "fs/promises";
import path from "path";

import { type ShowcaseFormat, type ShowcaseKind } from "@shared/showcase";

import { pathExists, toPosix } from "./paths";

export interface ScannedFile {
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

export interface ScanDirectoryOptions {
	baseDir: string;
	sourceBase: string;
	kind: ShowcaseKind;
	allowedExtensions: Set<string>;
	moduleKeyPrefix?: string;
	publicUrlPrefix?: string;
}

export interface ScanDirectoriesOptions {
	baseDir: string;
}

export async function scanDirectory(
	options: ScanDirectoryOptions
): Promise<ScannedFile[]> {
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
			const format = ext.replace(".", "") as ShowcaseFormat;
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

export async function scanDirectories(
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
