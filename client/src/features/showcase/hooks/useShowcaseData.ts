import { useMemo } from "react";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FileTreeItem, ShowcaseEntry, ShowcaseTreeResponse } from "@shared/showcase";

import { MANIFEST_QUERY_KEY, TREE_QUERY_KEY } from "../constants";

function flattenTree(items: FileTreeItem[]): FileTreeItem[] {
	const result: FileTreeItem[] = [];
	for (const item of items) {
		if (item.type === "file") {
			result.push(item);
		}
		if (item.children) {
			result.push(...flattenTree(item.children));
		}
	}
	return result;
}

export function useShowcaseData(
	selectedEntryId: string | null,
	actionEntryId: string | null
) {
	const queryClient = useQueryClient();

	const { data: rawTreeData, isLoading: treeLoading } =
		useQuery<ShowcaseTreeResponse>({
			queryKey: TREE_QUERY_KEY,
			placeholderData: { pages: [], components: [] },
		});

	const { data: manifestData, isLoading: manifestLoading } = useQuery<
		ShowcaseEntry[]
	>({
		queryKey: MANIFEST_QUERY_KEY,
	});

	const treeFetching = useIsFetching({ queryKey: TREE_QUERY_KEY });
	const manifestFetching = useIsFetching({ queryKey: MANIFEST_QUERY_KEY });
	const isReloading = treeFetching > 0 || manifestFetching > 0;

	const refetchShowcase = async () => {
		await Promise.all([
			queryClient.refetchQueries({ queryKey: TREE_QUERY_KEY }),
			queryClient.refetchQueries({ queryKey: MANIFEST_QUERY_KEY }),
		]);
	};

	const manifestById = useMemo(() => {
		const map = new Map<string, ShowcaseEntry>();
		manifestData?.forEach((entry) => map.set(entry.id, entry));
		return map;
	}, [manifestData]);

	const treeData = rawTreeData ?? { pages: [], components: [] };
	const pagesTree = Array.isArray(treeData.pages) ? treeData.pages : [];
	const componentsTree = Array.isArray(treeData.components)
		? treeData.components
		: [];

	const flatPages = useMemo(() => flattenTree(pagesTree), [pagesTree]);
	const flatComponents = useMemo(
		() => flattenTree(componentsTree),
		[componentsTree]
	);

	const selectedEntry = selectedEntryId
		? manifestById.get(selectedEntryId) ?? null
		: null;
	const actionEntry = actionEntryId
		? manifestById.get(actionEntryId) ?? null
		: null;
	const activeEntry = selectedEntry ?? actionEntry;
	const selectedEntryPath = selectedEntry?.sourcePath;

	return {
		actionEntry,
		activeEntry,
		componentsTree,
		flatComponents,
		flatPages,
		isReloading,
		manifestById,
		manifestLoading,
		pagesTree,
		refetchShowcase,
		selectedEntry,
		selectedEntryPath,
		treeLoading,
	};
}
