import type { ShowcaseEntry, ShowcaseTreeResponse } from "@shared/showcase";

import { loadDistJson } from "./showcase/artifacts";
import {
	generateManifest,
	generateTree,
	writeShowcaseArtifacts,
} from "./showcase/build";
import { notFoundError } from "./showcase/errors";
import { distManifestPath, distTreePath } from "./showcase/paths";
import {
	createShowcaseDirectory,
	deleteShowcaseFile,
	moveShowcaseFile,
	renameShowcaseFile,
} from "./showcase/mutations";

export { writeShowcaseArtifacts };

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

export {
	createShowcaseDirectory,
	deleteShowcaseFile,
	moveShowcaseFile,
	renameShowcaseFile,
};
