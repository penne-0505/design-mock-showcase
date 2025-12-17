import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

interface PagePreviewProps {
  name: string;
  path: string;
  content: React.ReactNode;
  onBack: () => void;
  breadcrumbItems: BreadcrumbItem[];
}

export function PagePreview({
  name,
  content,
  onBack,
  breadcrumbItems,
}: PagePreviewProps) {
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
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-12 px-6">{content}</div>
      </div>
    </div>
  );
}
