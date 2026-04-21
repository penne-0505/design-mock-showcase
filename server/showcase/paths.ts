import fs from "fs/promises";
import path from "path";

import { badRequestError, notFoundError } from "./errors";

export const JS_EXTENSIONS = new Set([".jsx", ".tsx"]);
export const HTML_EXTENSIONS = new Set([".html"]);
export const ALLOWED_EXTENSIONS = new Set([
	...JS_EXTENSIONS,
	...HTML_EXTENSIONS,
]);

// NOTE: Rely on process.cwd() so it works in both tsx (ESM) and bundled CJS.
export const workspaceRoot = process.cwd();
export const showcaseRoot = path.join(workspaceRoot, "showcase");
export const pagesJsxRoot = path.join(showcaseRoot, "pages");
export const componentsRoot = path.join(showcaseRoot, "components");
export const htmlPagesRoot = path.join(showcaseRoot, "pages");
export const htmlComponentsRoot = path.join(showcaseRoot, "components");

export const distPublicRoot = path.join(workspaceRoot, "dist", "public");
export const distTreePath = path.join(distPublicRoot, "showcase-tree.json");
export const distManifestPath = path.join(
	distPublicRoot,
	"showcase-manifest.json"
);

export function toPosix(value: string): string {
	return value.replace(/\\/g, "/");
}

export function resolveShowcasePath(relativePath: string): string {
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

export async function pathExists(target: string): Promise<boolean> {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
}

export async function ensureFileExists(filePath: string): Promise<void> {
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
