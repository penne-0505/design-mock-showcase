import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ShowcaseTabs } from "@/components/ShowcaseTabs";
import { PageCard } from "@/components/PageCard";
import { ComponentCard } from "@/components/ComponentCard";
import { FileTree, FileTreeItem } from "@/components/FileTree";
import { EmptyState } from "@/components/EmptyState";
import { ConfigPanel } from "@/components/ConfigPanel";
import { LoadingState } from "@/components/LoadingState";
import { PagePreview } from "@/components/PagePreview";
import { ComponentPreview } from "@/components/ComponentPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  lastModified?: string;
  children?: FileItem[];
}

// todo: remove mock functionality - replace with actual API data
const mockPagesTree: FileTreeItem[] = [
  {
    id: "p1",
    name: "marketing",
    type: "folder",
    path: "showcase/pages/marketing",
    children: [
      { id: "p2", name: "Landing Page Brief", type: "file", path: "showcase/pages/marketing/landing.tsx" },
      { id: "p3", name: "Pricing Page", type: "file", path: "showcase/pages/marketing/pricing.tsx" },
    ],
  },
  {
    id: "p4",
    name: "dashboard",
    type: "folder",
    path: "showcase/pages/dashboard",
    children: [
      { id: "p5", name: "Dashboard Design", type: "file", path: "showcase/pages/dashboard/main.tsx" },
      { id: "p6", name: "Analytics View", type: "file", path: "showcase/pages/dashboard/analytics.tsx" },
    ],
  },
  { id: "p7", name: "Settings Layout", type: "file", path: "showcase/pages/settings.tsx" },
  { id: "p8", name: "Profile Page", type: "file", path: "showcase/pages/profile.tsx" },
];

// todo: remove mock functionality
const mockComponentTree: FileTreeItem[] = [
  {
    id: "c1",
    name: "ui",
    type: "folder",
    path: "showcase/components/ui",
    children: [
      { id: "c2", name: "Button.tsx", type: "file", path: "showcase/components/ui/Button.tsx" },
      { id: "c3", name: "Card.tsx", type: "file", path: "showcase/components/ui/Card.tsx" },
      { id: "c4", name: "Input.tsx", type: "file", path: "showcase/components/ui/Input.tsx" },
      { id: "c5", name: "Badge.tsx", type: "file", path: "showcase/components/ui/Badge.tsx" },
    ],
  },
  {
    id: "c6",
    name: "layout",
    type: "folder",
    path: "showcase/components/layout",
    children: [
      { id: "c7", name: "Header.tsx", type: "file", path: "showcase/components/layout/Header.tsx" },
      { id: "c8", name: "Sidebar.tsx", type: "file", path: "showcase/components/layout/Sidebar.tsx" },
      { id: "c9", name: "Footer.tsx", type: "file", path: "showcase/components/layout/Footer.tsx" },
    ],
  },
  {
    id: "c10",
    name: "forms",
    type: "folder",
    path: "showcase/components/forms",
    children: [
      { id: "c11", name: "LoginForm.tsx", type: "file", path: "showcase/components/forms/LoginForm.tsx" },
      { id: "c12", name: "ContactForm.tsx", type: "file", path: "showcase/components/forms/ContactForm.tsx" },
    ],
  },
  { id: "c13", name: "Avatar.tsx", type: "file", path: "showcase/components/Avatar.tsx" },
  { id: "c14", name: "ThemeToggle.tsx", type: "file", path: "showcase/components/ThemeToggle.tsx" },
];

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
  const [configOpen, setConfigOpen] = useState(false);
  const [pagesDir, setPagesDir] = useState("./showcase/pages");
  const [componentsDir, setComponentsDir] = useState("./showcase/components");
  
  const [selectedPage, setSelectedPage] = useState<FileItem | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<FileTreeItem | null>(null);

  // todo: remove mock functionality - wire up to actual API
  const { data: pagesTree, isLoading: pagesLoading } = useQuery<FileTreeItem[]>({
    queryKey: ["/api/files/pages", pagesDir],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return mockPagesTree;
    },
  });

  const flatPages = pagesTree ? flattenTree(pagesTree) : [];

  const { data: componentTree, isLoading: componentsLoading } = useQuery<FileTreeItem[]>({
    queryKey: ["/api/files/components", componentsDir],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return mockComponentTree;
    },
  });

  const flatComponents = componentTree ? flattenTree(componentTree) : [];

  const handleSaveConfig = (newPagesDir: string, newComponentsDir: string) => {
    setPagesDir(newPagesDir);
    setComponentsDir(newComponentsDir);
  };

  // If viewing a specific page
  if (selectedPage) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header onOpenConfig={() => setConfigOpen(true)} />
        <PagePreview
          name={selectedPage.name}
          path={selectedPage.path}
          onBack={() => setSelectedPage(null)}
          breadcrumbItems={[
            { label: "Pages", onClick: () => setSelectedPage(null) },
            { label: selectedPage.name },
          ]}
          content={
            // todo: remove mock functionality - render actual JSX component
            <div className="prose dark:prose-invert max-w-none">
              <h2>Design Brief: {selectedPage.name}</h2>
              <p className="text-muted-foreground">
                This is a placeholder for the actual design brief content from{" "}
                <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{selectedPage.path}</code>
              </p>
              <h3>Overview</h3>
              <p>This design brief outlines the key design decisions and specifications for the {selectedPage.name.toLowerCase()}.</p>
              <h3>Color Palette</h3>
              <div className="flex gap-2 not-prose">
                <div className="w-12 h-12 rounded-md bg-primary" title="Primary" />
                <div className="w-12 h-12 rounded-md bg-secondary" title="Secondary" />
                <div className="w-12 h-12 rounded-md bg-accent" title="Accent" />
                <div className="w-12 h-12 rounded-md bg-muted" title="Muted" />
              </div>
              <h3>Typography</h3>
              <ul>
                <li>Headings: Inter, semibold</li>
                <li>Body: Inter, regular</li>
                <li>Code: JetBrains Mono</li>
              </ul>
              <h3>Key Features</h3>
              <ul>
                <li>Responsive layout adapting to all screen sizes</li>
                <li>Dark mode support with smooth transitions</li>
                <li>Accessible navigation with keyboard support</li>
              </ul>
            </div>
          }
        />
        <ConfigPanel
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          pagesDir={pagesDir}
          componentsDir={componentsDir}
          onSave={handleSaveConfig}
        />
      </div>
    );
  }

  // If viewing a specific component
  if (selectedComponent) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header onOpenConfig={() => setConfigOpen(true)} />
        <ComponentPreview
          name={selectedComponent.name.replace(".tsx", "")}
          path={selectedComponent.path}
          onBack={() => setSelectedComponent(null)}
          breadcrumbItems={[
            { label: "Components", onClick: () => setSelectedComponent(null) },
            { label: selectedComponent.name },
          ]}
          component={
            // todo: remove mock functionality - render actual component dynamically
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Component preview for</p>
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedComponent.path}</code>
            </div>
          }
        />
        <ConfigPanel
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          pagesDir={pagesDir}
          componentsDir={componentsDir}
          onSave={handleSaveConfig}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onOpenConfig={() => setConfigOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - shown for both tabs */}
        <aside className="w-64 border-r bg-sidebar flex-shrink-0 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              File Explorer
            </h2>
          </div>
          <ScrollArea className="flex-1 p-2">
            {activeTab === "pages" ? (
              pagesLoading ? (
                <LoadingState message="Scanning..." />
              ) : pagesTree && pagesTree.length > 0 ? (
                <FileTree
                  items={pagesTree}
                  selectedPath={undefined}
                  onSelect={(item) => setSelectedPage(item as FileItem)}
                />
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No pages found
                </div>
              )
            ) : (
              componentsLoading ? (
                <LoadingState message="Scanning..." />
              ) : componentTree && componentTree.length > 0 ? (
                <FileTree
                  items={componentTree}
                  selectedPath={undefined}
                  onSelect={(item) => setSelectedComponent(item)}
                />
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No components found
                </div>
              )
            )}
          </ScrollArea>
        </aside>
        <Separator orientation="vertical" />

        {/* Main content area */}
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

            {/* Pages Tab Content */}
            {activeTab === "pages" && (
              <>
                {pagesLoading ? (
                  <LoadingState message="Scanning for design briefs..." />
                ) : flatPages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {flatPages.map((page) => (
                      <PageCard
                        key={page.id}
                        id={page.id}
                        name={page.name}
                        path={page.path}
                        onClick={() => setSelectedPage(page as FileItem)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type="pages"
                    directory={pagesDir}
                    onConfigure={() => setConfigOpen(true)}
                  />
                )}
              </>
            )}

            {/* Components Tab Content */}
            {activeTab === "components" && (
              <>
                {componentsLoading ? (
                  <LoadingState message="Scanning for components..." />
                ) : flatComponents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flatComponents.map((component) => (
                      <ComponentCard
                        key={component.id}
                        id={component.id}
                        name={component.name.replace(".tsx", "")}
                        path={component.path}
                        onClick={() => setSelectedComponent(component)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type="components"
                    directory={componentsDir}
                    onConfigure={() => setConfigOpen(true)}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <ConfigPanel
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        pagesDir={pagesDir}
        componentsDir={componentsDir}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
