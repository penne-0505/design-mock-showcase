import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PagePreviewProps {
  name: string;
  path: string;
  content: React.ReactNode;
  onBack: () => void;
  contentClassName?: string;
  actions?: React.ReactNode;
}

export function PagePreview({
  name,
  path,
  content,
  onBack,
  contentClassName,
  actions,
}: PagePreviewProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="h-12 w-12 shrink-0 [&_svg]:h-6 [&_svg]:w-6"
              data-testid="button-back"
              aria-label="Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold">{name}</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                {path}
              </p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 pt-1">{actions}</div>}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className={cn("max-w-4xl mx-auto py-12 px-6", contentClassName)}>
          {content}
        </div>
      </div>
    </div>
  );
}
