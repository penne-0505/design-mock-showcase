import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ShowcaseEntry } from "@shared/showcase";

import { MANIFEST_QUERY_KEY } from "@/features/showcase/constants";

export function usePreviewEntry(entryId: string | null) {
	const decodedEntryId = useMemo(() => {
		if (!entryId) return null;
		try {
			return decodeURIComponent(entryId);
		} catch {
			return entryId;
		}
	}, [entryId]);

	const {
		data: manifestData,
		isLoading: manifestLoading,
		isError: manifestIsError,
		error: manifestError,
	} = useQuery<ShowcaseEntry[]>({
		queryKey: MANIFEST_QUERY_KEY,
	});

	const entry = useMemo(() => {
		if (!decodedEntryId) return null;
		return manifestData?.find((item) => item.id === decodedEntryId) ?? null;
	}, [decodedEntryId, manifestData]);

	return {
		decodedEntryId,
		entry,
		manifestError,
		manifestIsError,
		manifestLoading,
	};
}
