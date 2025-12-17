import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Folder } from "lucide-react";

interface ConfigPanelProps {
  open: boolean;
  onClose: () => void;
  pagesDir: string;
  componentsDir: string;
  onSave: (pagesDir: string, componentsDir: string) => void;
}

export function ConfigPanel({
  open,
  onClose,
  pagesDir,
  componentsDir,
  onSave,
}: ConfigPanelProps) {
  const [localPagesDir, setLocalPagesDir] = useState(pagesDir);
  const [localComponentsDir, setLocalComponentsDir] = useState(componentsDir);

  const handleSave = () => {
    onSave(localPagesDir, localComponentsDir);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent data-testid="config-panel">
        <SheetHeader>
          <SheetTitle>Configuration</SheetTitle>
          <SheetDescription>
            Set the directories to scan for design briefs and components.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="pages-dir" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Pages Directory
            </Label>
            <Input
              id="pages-dir"
              value={localPagesDir}
              onChange={(e) => setLocalPagesDir(e.target.value)}
              placeholder="./src/pages"
              className="font-mono text-sm"
              data-testid="input-pages-dir"
            />
            <p className="text-xs text-muted-foreground">
              Directory containing JSX design brief pages
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="components-dir" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Components Directory
            </Label>
            <Input
              id="components-dir"
              value={localComponentsDir}
              onChange={(e) => setLocalComponentsDir(e.target.value)}
              placeholder="./src/components"
              className="font-mono text-sm"
              data-testid="input-components-dir"
            />
            <p className="text-xs text-muted-foreground">
              Directory containing UI components (scanned recursively)
            </p>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-config">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
