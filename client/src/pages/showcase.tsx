import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ShowcaseTabs } from "@/components/ShowcaseTabs";
import { PageCard } from "@/components/PageCard";
import { ComponentCard } from "@/components/ComponentCard";
import { FileTree } from "@/components/FileTree";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShowcaseDetailView } from "@/features/showcase/components/ShowcaseDetailView";
import { ShowcaseDialogs } from "@/features/showcase/components/ShowcaseDialogs";
import {
	COMPONENTS_DIR_LABEL,
	COMPONENTS_ROOT_PATH,
	PAGES_DIR_LABEL,
	PAGES_ROOT_PATH,
	type ShowcaseTab,
} from "@/features/showcase/constants";
import { useShowcaseActions } from "@/features/showcase/hooks/useShowcaseActions";
import { useShowcaseData } from "@/features/showcase/hooks/useShowcaseData";
import { FolderPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
export default function Showcase() {
	const [activeTab, setActiveTab] = useState<ShowcaseTab>("pages");
	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
	const [renameOpen, setRenameOpen] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [actionEntryId, setActionEntryId] = useState<string | null>(null);
	const [createDirOpen, setCreateDirOpen] = useState(false);
	const [createDirName, setCreateDirName] = useState("");
	const [creatingDir, setCreatingDir] = useState(false);

	const {
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
	} = useShowcaseData(selectedEntryId, actionEntryId);

	const {
		handleCreateDirectory,
		handleDelete,
		handleMoveFile,
		handleReload,
		handleRename,
		openDeleteFor,
		openRenameFor,
	} = useShowcaseActions({
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
	});

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
						openRenameFor(entryId, manifestById.get(entryId) ?? null);
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

	const entryActions = selectedEntry ? (
		<div className="flex flex-wrap items-center gap-2">
			<Button
				size="sm"
				variant="outline"
				onClick={() => openRenameFor(selectedEntry.id, selectedEntry)}
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

	const showcaseDialogs = (
		<ShowcaseDialogs
			createDirName={createDirName}
			createDirOpen={createDirOpen}
			creatingDir={creatingDir}
			deleteOpen={deleteOpen}
			hasSelectedEntry={Boolean(selectedEntry)}
			onCreateDirNameChange={setCreateDirName}
			onCreateDirectory={handleCreateDirectory}
			onCreateDirOpenChange={setCreateDirOpen}
			onDelete={handleDelete}
			onDeleteOpenChange={setDeleteOpen}
			onRename={handleRename}
			onRenameOpenChange={setRenameOpen}
			onRenameValueChange={setRenameValue}
			onResetActionEntry={() => setActionEntryId(null)}
			renameOpen={renameOpen}
			renameValue={renameValue}
		/>
	);

	if (selectedEntry) {
		return (
			<ShowcaseDetailView
				dialogs={showcaseDialogs}
				entry={selectedEntry}
				isReloading={isReloading}
				onBack={() => setSelectedEntryId(null)}
				onReload={handleReload}
				previewContent={renderPreviewContent()}
				actions={entryActions}
			/>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			{showcaseDialogs}
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
										rootPath={PAGES_ROOT_PATH}
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
								rootPath={COMPONENTS_ROOT_PATH}
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
