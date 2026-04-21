import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {
	createShowcaseDirectory,
	deleteShowcaseFile,
	moveShowcaseFile,
	renameShowcaseFile,
} from "../server/showcase";

const workspaceRoot = process.cwd();
const showcasePagesRoot = path.join(workspaceRoot, "showcase", "pages");

function uniqueName(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function exists(targetPath: string): Promise<boolean> {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

test("createShowcaseDirectory creates a nested showcase directory", async () => {
	const dirName = uniqueName("__codex-create-dir");
	const relativeDirPath = path.join("showcase", "pages", dirName);
	const absoluteDirPath = path.join(showcasePagesRoot, dirName);

	try {
		const result = await createShowcaseDirectory({
			base: "pages",
			name: dirName,
		});

		assert.equal(result.createdPath, relativeDirPath.replace(/\\/g, "/"));
		const stats = await fs.stat(absoluteDirPath);
		assert.equal(stats.isDirectory(), true);
	} finally {
		await fs.rm(absoluteDirPath, { recursive: true, force: true });
	}
});

test("rename, move, and delete showcase files preserves expected paths", async () => {
	const rootDirName = uniqueName("__codex-file-ops");
	const moveDirName = "moved";
	const absoluteRootDirPath = path.join(showcasePagesRoot, rootDirName);
	const absoluteMoveDirPath = path.join(absoluteRootDirPath, moveDirName);
	const originalRelativePath = path
		.join("showcase", "pages", rootDirName, "sample.jsx")
		.replace(/\\/g, "/");
	const renamedRelativePath = path
		.join("showcase", "pages", rootDirName, "renamed.jsx")
		.replace(/\\/g, "/");
	const movedRelativePath = path
		.join("showcase", "pages", rootDirName, moveDirName, "renamed.jsx")
		.replace(/\\/g, "/");

	try {
		await fs.mkdir(absoluteMoveDirPath, { recursive: true });
		await fs.writeFile(
			path.join(absoluteRootDirPath, "sample.jsx"),
			"export default function Sample() { return null; }\n",
			"utf-8"
		);

		const renameResult = await renameShowcaseFile({
			path: originalRelativePath,
			newName: "renamed",
		});
		assert.equal(renameResult.previousPath, originalRelativePath);
		assert.equal(renameResult.newPath, renamedRelativePath);
		assert.equal(await exists(path.join(absoluteRootDirPath, "renamed.jsx")), true);

		const moveResult = await moveShowcaseFile({
			path: renamedRelativePath,
			targetDir: path
				.join("showcase", "pages", rootDirName, moveDirName)
				.replace(/\\/g, "/"),
		});
		assert.equal(moveResult.previousPath, renamedRelativePath);
		assert.equal(moveResult.newPath, movedRelativePath);
		assert.equal(
			await exists(path.join(absoluteMoveDirPath, "renamed.jsx")),
			true
		);

		const deleteResult = await deleteShowcaseFile(movedRelativePath);
		assert.equal(deleteResult.deletedPath, movedRelativePath);
		assert.equal(
			await exists(path.join(absoluteMoveDirPath, "renamed.jsx")),
			false
		);
	} finally {
		await fs.rm(absoluteRootDirPath, { recursive: true, force: true });
	}
});
