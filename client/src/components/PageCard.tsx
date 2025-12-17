import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileText } from "lucide-react";

export interface PageCardProps {
  id: string;
  name: string;
  path: string;
  lastModified?: string;
  onClick: () => void;
}

export function PageCard({ name, path, lastModified, onClick }: PageCardProps) {
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-colors"
      onClick={onClick}
      data-testid={`page-card-${name}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{name}</h3>
            <p className="text-xs font-mono text-muted-foreground truncate mt-1">{path}</p>
          </div>
        </div>
      </CardContent>
      {lastModified && (
        <CardFooter className="pt-0">
          <span className="text-xs text-muted-foreground">Modified: {lastModified}</span>
        </CardFooter>
      )}
    </Card>
  );
}
