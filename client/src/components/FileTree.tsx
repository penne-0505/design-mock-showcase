import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileTreeItem[];
}

interface FileTreeProps {
  items: FileTreeItem[];
  selectedPath?: string;
  onSelect: (item: FileTreeItem) => void;
  level?: number;
}

export function FileTree({ items, selectedPath, onSelect, level = 0 }: FileTreeProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <FileTreeNode
          key={item.id}
          item={item}
          selectedPath={selectedPath}
          onSelect={onSelect}
          level={level}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  selectedPath?: string;
  onSelect: (item: FileTreeItem) => void;
  level: number;
}

function FileTreeNode({ item, selectedPath, onSelect, level }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPath === item.path;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.type === "folder") {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover-elevate active-elevate-2",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground",
          !isSelected && "text-sidebar-foreground"
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
