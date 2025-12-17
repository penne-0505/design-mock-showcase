import { Card, CardContent } from "@/components/ui/card";
import { Puzzle } from "lucide-react";

export interface ComponentCardProps {
  id: string;
  name: string;
  path: string;
  preview?: React.ReactNode;
  onClick: () => void;
}

export function ComponentCard({ name, path, preview, onClick }: ComponentCardProps) {
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-colors overflow-hidden"
      onClick={onClick}
      data-testid={`component-card-${name}`}
    >
      <div className="bg-muted/50 p-6 min-h-[120px] flex items-center justify-center border-b">
        {preview || (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Puzzle className="h-8 w-8" />
            <span className="text-xs">Preview</span>
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="text-base font-semibold truncate">{name}</h3>
        <p className="text-xs font-mono text-muted-foreground truncate mt-1">{path}</p>
      </CardContent>
    </Card>
  );
}
