import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileCode } from "lucide-react";
import { FileTreeItem } from "@shared/showcase";
import { cn } from "@/lib/utils";

interface FileTreeProps {
	items: FileTreeItem[];
	selectedPath?: string;
	onSelect: (item: FileTreeItem) => void;
	onMove?: (sourcePath: string, targetDir: string) => void;
	rootPath?: string;
	level?: number;
}

export function FileTree({
	items,
	selectedPath,
	onSelect,
	onMove,
	rootPath,
	level = 0,
}: FileTreeProps) {
	const handleRootDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (!onMove || !rootPath || level !== 0) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	};

	const handleRootDrop = (event: React.DragEvent<HTMLDivElement>) => {
		if (!onMove || !rootPath || level !== 0) return;
		event.preventDefault();
		const sourcePath =
			event.dataTransfer.getData("application/x-showcase-path") ||
			event.dataTransfer.getData("text/plain");
		if (!sourcePath) return;
		onMove(sourcePath, rootPath);
	};

	return (
		<div
			className="space-y-0.5"
			onDragOver={handleRootDragOver}
			onDrop={handleRootDrop}
		>
			{items.map((item) => (
				<FileTreeNode
					key={item.id}
					item={item}
					selectedPath={selectedPath}
					onSelect={onSelect}
					onMove={onMove}
					level={level}
				/>
			))}
		</div>
	);
}

export type { FileTreeItem };

interface FileTreeNodeProps {
	item: FileTreeItem;
	selectedPath?: string;
	onSelect: (item: FileTreeItem) => void;
	onMove?: (sourcePath: string, targetDir: string) => void;
	level: number;
}

function FileTreeNode({
	item,
	selectedPath,
	onSelect,
	onMove,
	level,
}: FileTreeNodeProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [isDragOver, setIsDragOver] = useState(false);
	const isSelected = selectedPath === item.path;
	const hasChildren = item.children && item.children.length > 0;

	const handleClick = () => {
		if (item.type === "folder") {
			setIsOpen(!isOpen);
		} else {
			onSelect(item);
		}
	};

	const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
		if (item.type !== "file" || !onMove) return;
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("application/x-showcase-path", item.path);
		event.dataTransfer.setData("text/plain", item.path);
	};

	const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
		if (item.type !== "folder" || !onMove) return;
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = "move";
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		if (item.type !== "folder" || !onMove) return;
		setIsDragOver(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
		if (item.type !== "folder" || !onMove) return;
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);
		const sourcePath =
			event.dataTransfer.getData("application/x-showcase-path") ||
			event.dataTransfer.getData("text/plain");
		if (!sourcePath) return;
		onMove(sourcePath, item.path);
	};

	return (
		<div>
			<button
				onClick={handleClick}
				draggable={item.type === "file" && Boolean(onMove)}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover-elevate active-elevate-2",
					isSelected && "bg-sidebar-accent text-sidebar-accent-foreground",
					!isSelected && "text-sidebar-foreground",
					isDragOver && "ring-2 ring-primary/40"
				)}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
				data-testid={`file-tree-item-${item.id}`}
			>
				{item.type === "folder" ? (
					<>
						{isOpen ? (
							<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
						) : (
							<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
						)}
						<Folder className="h-4 w-4 text-muted-foreground" />
					</>
				) : (
					<>
						<span className="w-3.5" />
						<FileCode className="h-4 w-4 text-muted-foreground" />
					</>
				)}
				<span className="truncate">{item.name}</span>
			</button>
			{item.type === "folder" && isOpen && hasChildren && (
				<FileTree
					items={item.children!}
					selectedPath={selectedPath}
					onSelect={onSelect}
					level={level + 1}
				/>
			)}
		</div>
	);
}
