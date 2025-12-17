import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { Card } from "@/components/ui/card";

interface ComponentPreviewProps {
  name: string;
  path: string;
  component: React.ReactNode;
  onBack: () => void;
  breadcrumbItems: BreadcrumbItem[];
}

export function ComponentPreview({
  name,
  path,
  component,
  onBack,
  breadcrumbItems,
}: ComponentPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <h1 className="text-3xl font-semibold">{name}</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">{path}</p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <Card className="p-8">
          <div className="flex items-center justify-center min-h-[200px]">
            {component}
          </div>
        </Card>
      </div>
    </div>
  );
}
