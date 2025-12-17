import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { ShowcaseEntry, ShowcaseTreeResponse } from "@shared/showcase";

const PAGES_DIR_LABEL = "client/src/showcase/pages";
const COMPONENTS_DIR_LABEL = "client/src/showcase/components";

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

	const { data: treeData, isLoading: treeLoading } =
		useQuery<ShowcaseTreeResponse>({
			queryKey: ["/api/showcase/tree"],
		});

	const { data: manifestData, isLoading: manifestLoading } = useQuery<
		ShowcaseEntry[]
	>({
		queryKey: ["/api/showcase/manifest"],
	});

	const manifestById = useMemo(() => {
		const map = new Map<string, ShowcaseEntry>();
		manifestData?.forEach((entry) => map.set(entry.id, entry));
		return map;
	}, [manifestData]);

	const pagesTree = useMemo(
		() => [...(treeData?.pages ?? []), ...(treeData?.htmlPages ?? [])],
		[treeData]
	);
	const componentsTree = useMemo(() => treeData?.components ?? [], [treeData]);

	const flatPages = useMemo(() => flattenTree(pagesTree), [pagesTree]);
	const flatComponents = useMemo(
		() => flattenTree(componentsTree),
		[componentsTree]
	);

	const selectedEntry = selectedEntryId
		? manifestById.get(selectedEntryId) ?? null
		: null;

	const selectedEntryPath = selectedEntry?.sourcePath;

	const renderPreviewContent = () => {
		if (!selectedEntry) return null;

		if (selectedEntry.format === "html") {
			return selectedEntry.publicUrl ? (
				<div className="rounded-md border bg-muted/30 overflow-hidden min-h-[480px]">
					<iframe
						src={selectedEntry.publicUrl}
						title={selectedEntry.name}
						className="w-full h-full min-h-[480px] bg-white"
					/>
				</div>
			) : (
				<div className="text-sm text-muted-foreground">
					No public URL available for this HTML entry.
				</div>
			);
		}

		return (
			<div className="rounded-md border bg-muted/30 overflow-hidden min-h-[480px]">
				<iframe
					src={`/preview/${selectedEntry.id}`}
					title={selectedEntry.name}
					className="w-full h-full min-h-[480px] bg-background"
				/>
			</div>
		);
	};

	if (selectedEntry) {
		const breadcrumbItems = [
			{
				label: selectedEntry.kind === "page" ? "Pages" : "Components",
				onClick: () => setSelectedEntryId(null),
			},
			{ label: selectedEntry.name },
		];

		if (selectedEntry.kind === "page") {
			return (
				<div className="flex flex-col h-screen bg-background">
					<Header />
					<PagePreview
						name={selectedEntry.name}
						path={selectedEntry.sourcePath}
						onBack={() => setSelectedEntryId(null)}
						breadcrumbItems={breadcrumbItems}
						content={renderPreviewContent()}
					/>
				</div>
			);
		}

		return (
			<div className="flex flex-col h-screen bg-background">
				<Header />
				<ComponentPreview
					name={selectedEntry.name}
					path={selectedEntry.sourcePath}
					onBack={() => setSelectedEntryId(null)}
					breadcrumbItems={breadcrumbItems}
					component={renderPreviewContent()}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			<Header />

			<div className="flex-1 flex overflow-hidden">
				<aside className="w-64 border-r bg-sidebar flex-shrink-0 flex flex-col">
					<div className="p-4 border-b">
						<h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							File Explorer
						</h2>
					</div>
					<ScrollArea className="flex-1 p-2">
						{activeTab === "pages" ? (
							treeLoading ? (
								<LoadingState message="Scanning..." />
							) : pagesTree.length > 0 ? (
								<FileTree
									items={pagesTree}
									selectedPath={selectedEntryPath}
									onSelect={(item) => setSelectedEntryId(item.id)}
								/>
							) : (
								<div className="p-4 text-sm text-muted-foreground text-center">
									No pages found
								</div>
							)
						) : treeLoading ? (
							<LoadingState message="Scanning..." />
						) : componentsTree.length > 0 ? (
							<FileTree
								items={componentsTree}
								selectedPath={selectedEntryPath}
								onSelect={(item) => setSelectedEntryId(item.id)}
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
								pagesCount={flatPages.length}
								componentsCount={flatComponents.length}
							/>
						</div>

						{activeTab === "pages" && (
							<>
								{treeLoading || manifestLoading ? (
									<LoadingState message="Scanning for design briefs..." />
								) : flatPages.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{flatPages.map((page) => (
											<PageCard
												key={page.id}
												id={page.id}
												name={page.name}
												path={page.path}
												onClick={() => setSelectedEntryId(page.id)}
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
								) : flatComponents.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{flatComponents.map((component) => (
											<ComponentCard
												key={component.id}
												id={component.id}
												name={component.name}
												path={component.path}
												onClick={() => setSelectedEntryId(component.id)}
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
