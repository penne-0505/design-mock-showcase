import React, { useMemo, useState } from "react";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ShowcaseTabs } from "@/components/ShowcaseTabs";
import { PageCard } from "@/components/PageCard";
import { ComponentCard } from "@/components/ComponentCard";
import { FileTree, FileTreeItem } from "@/components/FileTree";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PagePreview } from "@/components/PagePreview";
import { ComponentPreview } from "@/components/ComponentPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { FolderPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { ShowcaseEntry, ShowcaseTreeResponse } from "@shared/showcase";

const PAGES_DIR_LABEL = "./showcase/pages";
const COMPONENTS_DIR_LABEL = "./showcase/components";
const TREE_QUERY_KEY = ["/api/showcase/tree"];
const MANIFEST_QUERY_KEY = ["/api/showcase/manifest"];

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

export default function Showcase() {
	const [activeTab, setActiveTab] = useState<"pages" | "components">("pages");
	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [renameOpen, setRenameOpen] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [actionEntryId, setActionEntryId] = useState<string | null>(null);
	const [createDirOpen, setCreateDirOpen] = useState(false);
	const [createDirName, setCreateDirName] = useState("");
	const [creatingDir, setCreatingDir] = useState(false);

	const { data: rawTreeData, isLoading: treeLoading } =
		useQuery<ShowcaseTreeResponse>({
			queryKey: TREE_QUERY_KEY,
			placeholderData: { pages: [], components: [], htmlPages: [] },
		});

	const { data: manifestData, isLoading: manifestLoading } = useQuery<
		ShowcaseEntry[]
	>({
		queryKey: MANIFEST_QUERY_KEY,
	});
	const treeFetching = useIsFetching({ queryKey: TREE_QUERY_KEY });
	const manifestFetching = useIsFetching({ queryKey: MANIFEST_QUERY_KEY });
	const isReloading = treeFetching > 0 || manifestFetching > 0;

	const handleReload = async (options?: { silent?: boolean }) => {
		await Promise.all([
			queryClient.refetchQueries({ queryKey: TREE_QUERY_KEY }),
			queryClient.refetchQueries({ queryKey: MANIFEST_QUERY_KEY }),
		]);
		if (!options?.silent) {
			toast({
				variant: "success",
				title: "リロードが完了しました",
			});
		}
	};

	const manifestById = useMemo(() => {
		const map = new Map<string, ShowcaseEntry>();
		manifestData?.forEach((entry) => map.set(entry.id, entry));
		return map;
	}, [manifestData]);

	const treeData = rawTreeData ?? { pages: [], components: [], htmlPages: [] };
	const pagesList = Array.isArray(treeData.pages) ? treeData.pages : [];
	const htmlPagesList = Array.isArray(treeData.htmlPages)
		? treeData.htmlPages
		: [];
	const pagesTree = pagesList.concat(htmlPagesList);
	const componentsTree = Array.isArray(treeData.components)
		? treeData.components
		: [];

	const flatPages = flattenTree(Array.isArray(pagesTree) ? pagesTree : []);
	const flatComponents = flattenTree(
		Array.isArray(componentsTree) ? componentsTree : []
	);

	const selectedEntry = selectedEntryId
		? manifestById.get(selectedEntryId) ?? null
		: null;
	const actionEntry = actionEntryId
		? manifestById.get(actionEntryId) ?? null
		: null;
	const activeEntry = selectedEntry ?? actionEntry;

	const selectedEntryPath = selectedEntry?.sourcePath;

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

	const openRenameFor = (entryId: string) => {
		const entry = manifestById.get(entryId) ?? null;
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

	const renderCardMenu = (entryId: string) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="h-12 w-12"
					aria-label="Open item actions"
					onClick={(event) => event.stopPropagation()}
					onPointerDown={(event) => event.stopPropagation()}
				>
					<MoreVertical className="h-12 w-12" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-40"
				onClick={(event) => event.stopPropagation()}
				onPointerDown={(event) => event.stopPropagation()}
			>
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
						event.stopPropagation();
						openRenameFor(entryId);
					}}
				>
					<Pencil className="h-4 w-4" />
					編集
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
						event.stopPropagation();
						openDeleteFor(entryId);
					}}
					className="text-destructive focus:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
					削除
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const renameDialog = (
		<Dialog
			open={renameOpen}
			onOpenChange={(open) => {
				setRenameOpen(open);
				if (!open && !selectedEntry) {
					setActionEntryId(null);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ファイル名の変更</DialogTitle>
					<DialogDescription>
						新しいファイル名を入力してください。
					</DialogDescription>
				</DialogHeader>
				<form
					className="grid gap-2 py-2"
					onSubmit={(event) => {
						event.preventDefault();
						handleRename();
					}}
				>
					<div className="grid gap-2">
						<Label htmlFor="rename-input">新しいファイル名</Label>
						<Input
							id="rename-input"
							value={renameValue}
							onChange={(event) => setRenameValue(event.target.value)}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setRenameOpen(false)}
						>
							キャンセル
						</Button>
						<Button type="submit" disabled={!renameValue.trim()}>
							変更する
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);

	const deleteDialog = (
		<AlertDialog
			open={deleteOpen}
			onOpenChange={(open) => {
				setDeleteOpen(open);
				if (!open && !selectedEntry) {
					setActionEntryId(null);
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
					<AlertDialogDescription>
						この操作は取り消せません。
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>キャンセル</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						削除する
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);

	const createDirectoryDialog = (
		<Dialog
			open={createDirOpen}
			onOpenChange={(open) => {
				setCreateDirOpen(open);
				if (!open) {
					setCreateDirName("");
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ディレクトリ追加</DialogTitle>
					<DialogDescription>
						追加するディレクトリ名を入力してください。
					</DialogDescription>
				</DialogHeader>
				<form
					className="grid gap-2 py-2"
					onSubmit={(event) => {
						event.preventDefault();
						handleCreateDirectory();
					}}
				>
					<div className="grid gap-2">
						<Label htmlFor="create-dir-input">ディレクトリ名</Label>
						<Input
							id="create-dir-input"
							value={createDirName}
							onChange={(event) => setCreateDirName(event.target.value)}
							placeholder="new-folder"
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreateDirOpen(false)}
						>
							キャンセル
						</Button>
						<Button
							type="submit"
							disabled={creatingDir || !createDirName.trim()}
						>
							追加する
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);

	const entryActions = selectedEntry ? (
		<div className="flex flex-wrap items-center gap-2">
			<Button
				size="sm"
				variant="outline"
				onClick={() => openRenameFor(selectedEntry.id)}
			>
				<Pencil className="h-4 w-4 mr-2" />
				名前を変更
			</Button>
			<Button
				size="sm"
				variant="destructive"
				onClick={() => openDeleteFor(selectedEntry.id)}
			>
				<Trash2 className="h-4 w-4 mr-2" />
				削除
			</Button>
		</div>
	) : null;

	const renderPreviewContent = () => {
		if (!selectedEntry) return null;

		const isComponent = selectedEntry.kind === "component";
		const frameClassName = isComponent
			? "rounded-lg bg-background overflow-hidden min-h-[360px] h-[calc(100vh-320px)] max-h-[640px]"
			: "rounded-md border bg-muted/30 overflow-hidden min-h-[480px] h-[calc(100vh-220px)]";

		if (selectedEntry.format === "html") {
			return selectedEntry.publicUrl ? (
				<div className={frameClassName}>
					<iframe
						src={selectedEntry.publicUrl}
						title={selectedEntry.name}
						className="w-full h-full bg-white"
					/>
				</div>
			) : (
				<div className="text-sm text-muted-foreground">
					No public URL available for this HTML entry.
				</div>
			);
		}

		return (
			<div className={frameClassName}>
				<iframe
					src={`/preview/${encodeURIComponent(selectedEntry.id)}`}
					title={selectedEntry.name}
					className="w-full h-full bg-background"
				/>
			</div>
		);
	};

	if (selectedEntry) {
		if (selectedEntry.kind === "page") {
			return (
				<div className="flex flex-col h-screen bg-background">
					{renameDialog}
					{deleteDialog}
					<Header
						onReload={handleReload}
						isReloading={isReloading}
						onHomeClick={() => setSelectedEntryId(null)}
					/>
					<PagePreview
						name={selectedEntry.name}
						path={selectedEntry.sourcePath}
						onBack={() => setSelectedEntryId(null)}
						content={renderPreviewContent()}
						contentClassName="w-full max-w-none p-6"
						actions={entryActions}
					/>
				</div>
			);
		}

		return (
			<div className="flex flex-col h-screen bg-background">
				{renameDialog}
				{deleteDialog}
				<Header
					onReload={handleReload}
					isReloading={isReloading}
					onHomeClick={() => setSelectedEntryId(null)}
				/>
				<ComponentPreview
					name={selectedEntry.name}
					path={selectedEntry.sourcePath}
					onBack={() => setSelectedEntryId(null)}
					component={renderPreviewContent()}
					actions={entryActions}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			{renameDialog}
			{deleteDialog}
			{createDirectoryDialog}
			<Header
				onReload={handleReload}
				isReloading={isReloading}
				onHomeClick={() => setSelectedEntryId(null)}
			/>

			<div className="flex-1 flex overflow-hidden">
				<aside className="w-64 border-r bg-sidebar flex-shrink-0 flex flex-col group">
					<div className="p-4 border-b flex items-center justify-between gap-2">
						<h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							File Explorer
						</h2>
						<Button
							size="icon"
							variant="outline"
							onClick={() => setCreateDirOpen(true)}
							aria-label="ディレクトリ追加"
							data-testid="button-create-directory"
							className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
						>
							<FolderPlus className="h-4 w-4" />
						</Button>
					</div>
					<ScrollArea className="flex-1 p-2">
						{activeTab === "pages" ? (
							treeLoading ? (
								<LoadingState message="Scanning..." />
							) : (pagesTree?.length ?? 0) > 0 ? (
									<FileTree
										items={Array.isArray(pagesTree) ? pagesTree : []}
										selectedPath={selectedEntryPath}
										onSelect={(item) => setSelectedEntryId(item.id)}
										onMove={handleMoveFile}
										rootPath="showcase/pages"
									/>
								) : (
									<div className="p-4 text-sm text-muted-foreground text-center">
										No pages found
									</div>
							)
						) : treeLoading ? (
							<LoadingState message="Scanning..." />
						) : (componentsTree?.length ?? 0) > 0 ? (
							<FileTree
								items={Array.isArray(componentsTree) ? componentsTree : []}
								selectedPath={selectedEntryPath}
								onSelect={(item) => setSelectedEntryId(item.id)}
								onMove={handleMoveFile}
								rootPath="showcase/components"
							/>
						) : (
							<div className="p-4 text-sm text-muted-foreground text-center">
								No components found
							</div>
						)}
					</ScrollArea>
				</aside>
				<Separator orientation="vertical" />

				<main className="flex-1 overflow-auto">
					<div className="max-w-7xl mx-auto px-6 py-8">
						<div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
							<ShowcaseTabs
								activeTab={activeTab}
								onTabChange={setActiveTab}
								pagesCount={flatPages?.length ?? 0}
								componentsCount={flatComponents?.length ?? 0}
							/>
						</div>

						{activeTab === "pages" && (
							<>
								{treeLoading || manifestLoading ? (
									<LoadingState message="Scanning for design briefs..." />
								) : (flatPages?.length ?? 0) > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{flatPages.map((page) => (
											<PageCard
												key={page.id}
												id={page.id}
												name={page.name}
												path={page.path}
												onClick={() => setSelectedEntryId(page.id)}
												menu={renderCardMenu(page.id)}
											/>
										))}
									</div>
								) : (
									<EmptyState type="pages" directory={PAGES_DIR_LABEL} />
								)}
							</>
						)}

						{activeTab === "components" && (
							<>
								{treeLoading || manifestLoading ? (
									<LoadingState message="Scanning for components..." />
								) : (flatComponents?.length ?? 0) > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{flatComponents.map((component) => (
											<ComponentCard
												key={component.id}
												id={component.id}
												name={component.name}
												path={component.path}
												onClick={() => setSelectedEntryId(component.id)}
												menu={renderCardMenu(component.id)}
											/>
										))}
									</div>
								) : (
									<EmptyState
										type="components"
										directory={COMPONENTS_DIR_LABEL}
									/>
								)}
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
