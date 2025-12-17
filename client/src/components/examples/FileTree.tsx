import { useState } from "react";
import { FileTree, FileTreeItem } from "../FileTree";

const mockTree: FileTreeItem[] = [
  {
    id: "1",
    name: "ui",
    type: "folder",
    path: "components/ui",
    children: [
      { id: "2", name: "Button.tsx", type: "file", path: "components/ui/Button.tsx" },
      { id: "3", name: "Card.tsx", type: "file", path: "components/ui/Card.tsx" },
      { id: "4", name: "Input.tsx", type: "file", path: "components/ui/Input.tsx" },
    ],
  },
  {
    id: "5",
    name: "layout",
    type: "folder",
    path: "components/layout",
    children: [
      { id: "6", name: "Header.tsx", type: "file", path: "components/layout/Header.tsx" },
      { id: "7", name: "Sidebar.tsx", type: "file", path: "components/layout/Sidebar.tsx" },
    ],
  },
  { id: "8", name: "Avatar.tsx", type: "file", path: "components/Avatar.tsx" },
];

export default function FileTreeExample() {
  const [selected, setSelected] = useState<string | undefined>();
  return (
    <div className="w-64 bg-sidebar p-2 rounded-md">
      <FileTree
        items={mockTree}
        selectedPath={selected}
        onSelect={(item) => setSelected(item.path)}
      />
    </div>
  );
}
