import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import type { ShowcaseEntry } from "@shared/showcase";

import type { ShowcaseTab } from "../constants";

interface UseShowcaseActionsOptions {
	activeEntry: ShowcaseEntry | null;
	activeTab: ShowcaseTab;
	actionEntryId: string | null;
	createDirName: string;
	refetchShowcase: () => Promise<void>;
	renameValue: string;
	selectedEntry: ShowcaseEntry | null;
	selectedEntryId: string | null;
	setActionEntryId: (value: string | null) => void;
	setCreateDirName: (value: string) => void;
	setCreateDirOpen: (value: boolean) => void;
	setCreatingDir: (value: boolean) => void;
	setDeleteOpen: (value: boolean) => void;
	setRenameOpen: (value: boolean) => void;
	setRenameValue: (value: string) => void;
	setSelectedEntryId: (value: string | null) => void;
}

export function useShowcaseActions({
	activeEntry,
	activeTab,
	actionEntryId,
	createDirName,
	refetchShowcase,
	renameValue,
	selectedEntry,
	selectedEntryId,
	setActionEntryId,
	setCreateDirName,
	setCreateDirOpen,
	setCreatingDir,
	setDeleteOpen,
	setRenameOpen,
	setRenameValue,
	setSelectedEntryId,
}: UseShowcaseActionsOptions) {
	const { toast } = useToast();

	const handleReload = async (options?: { silent?: boolean }) => {
		await refetchShowcase();
		if (!options?.silent) {
			toast({
				variant: "success",
				title: "リロードが完了しました",
			});
		}
	};

	const handleRename = async () => {
		if (!activeEntry) return;
		const nextName = renameValue.trim();
		if (!nextName) {
			toast({
				variant: "destructive",
				title: "ファイル名を入力してください",
			});
			return;
		}
		try {
			const res = await apiRequest("POST", "/api/showcase/rename", {
				path: activeEntry.sourcePath,
				newName: nextName,
			});
			const payload = (await res.json()) as { newPath?: string };
			setRenameOpen(false);
			if (!selectedEntry) {
				setActionEntryId(null);
			}
			await handleReload({ silent: true });
			if (payload?.newPath) {
				if (selectedEntry) {
					setSelectedEntryId(payload.newPath);
				} else {
					setActionEntryId(payload.newPath);
				}
			}
			toast({
				variant: "success",
				title: "ファイル名を変更しました",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "リネームに失敗しました",
				description:
					error instanceof Error ? error.message : "操作に失敗しました。",
			});
		}
	};

	const handleDelete = async () => {
		if (!activeEntry) return;
		try {
			await apiRequest("POST", "/api/showcase/delete", {
				path: activeEntry.sourcePath,
			});
			setDeleteOpen(false);
			if (selectedEntry) {
				setSelectedEntryId(null);
			} else {
				setActionEntryId(null);
			}
			await handleReload({ silent: true });
			toast({
				variant: "success",
				title: "ファイルを削除しました",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "削除に失敗しました",
				description:
					error instanceof Error ? error.message : "操作に失敗しました。",
			});
		}
	};

	const handleCreateDirectory = async () => {
		const trimmedName = createDirName.trim();
		if (!trimmedName) {
			toast({
				variant: "destructive",
				title: "ディレクトリ名を入力してください",
			});
			return;
		}
		try {
			setCreatingDir(true);
			await apiRequest("POST", "/api/showcase/directory", {
				base: activeTab,
				name: trimmedName,
			});
			setCreateDirOpen(false);
			setCreateDirName("");
			await handleReload({ silent: true });
			toast({
				variant: "success",
				title: "ディレクトリを追加しました",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "ディレクトリの追加に失敗しました",
				description:
					error instanceof Error ? error.message : "操作に失敗しました。",
			});
		} finally {
			setCreatingDir(false);
		}
	};

	const openRenameFor = (entryId: string, entry?: ShowcaseEntry | null) => {
		setActionEntryId(entryId);
		setRenameValue(entry ? `${entry.name}.${entry.format}` : "");
		setRenameOpen(true);
	};

	const openDeleteFor = (entryId: string) => {
		setActionEntryId(entryId);
		setDeleteOpen(true);
	};

	const handleMoveFile = async (sourcePath: string, targetDir: string) => {
		const normalizedSource = sourcePath.replace(/\\/g, "/");
		const normalizedTarget = targetDir.replace(/\\/g, "/");
		const sourceDir = normalizedSource.split("/").slice(0, -1).join("/");
		if (!normalizedSource || !normalizedTarget || sourceDir === normalizedTarget) {
			return;
		}

		try {
			const res = await apiRequest("POST", "/api/showcase/move", {
				path: normalizedSource,
				targetDir: normalizedTarget,
			});
			const payload = (await res.json()) as { newPath?: string };
			await handleReload({ silent: true });
			if (payload?.newPath) {
				if (selectedEntryId === normalizedSource) {
					setSelectedEntryId(payload.newPath);
				}
				if (actionEntryId === normalizedSource) {
					setActionEntryId(payload.newPath);
				}
			}
			toast({
				variant: "success",
				title: "ファイルを移動しました",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "ファイルの移動に失敗しました",
				description:
					error instanceof Error ? error.message : "操作に失敗しました。",
			});
		}
	};

	return {
		handleCreateDirectory,
		handleDelete,
		handleMoveFile,
		handleReload,
		handleRename,
		openDeleteFor,
		openRenameFor,
	};
}
