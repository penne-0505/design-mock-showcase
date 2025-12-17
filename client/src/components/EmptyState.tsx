import { FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "pages" | "components";
  directory?: string;
  onConfigure?: () => void;
}

export function EmptyState({ type, directory, onConfigure }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="empty-state"
    >
      <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        No {type === "pages" ? "design briefs" : "components"} found
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {directory ? (
          <>
            No files were found in <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{directory}</code>
          </>
        ) : (
          `Configure the ${type === "pages" ? "pages" : "components"} directory to get started.`
        )}
      </p>
      {onConfigure && (
        <Button onClick={onConfigure} data-testid="button-configure">
          <Settings className="h-4 w-4 mr-2" />
          Configure Directory
        </Button>
      )}
    </div>
  );
}
