import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Puzzle } from "lucide-react";

interface ShowcaseTabsProps {
  activeTab: "pages" | "components";
  onTabChange: (tab: "pages" | "components") => void;
  pagesCount?: number;
  componentsCount?: number;
}

export function ShowcaseTabs({
  activeTab,
  onTabChange,
  pagesCount = 0,
  componentsCount = 0,
}: ShowcaseTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "pages" | "components")}>
      <TabsList className="bg-muted">
        <TabsTrigger
          value="pages"
          className="gap-2 text-sm font-medium uppercase tracking-wide"
          data-testid="tab-pages"
        >
          <FileText className="h-4 w-4" />
          Pages {pagesCount > 0 && `(${pagesCount})`}
        </TabsTrigger>
        <TabsTrigger
          value="components"
          className="gap-2 text-sm font-medium uppercase tracking-wide"
          data-testid="tab-components"
        >
          <Puzzle className="h-4 w-4" />
          Components {componentsCount > 0 && `(${componentsCount})`}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
