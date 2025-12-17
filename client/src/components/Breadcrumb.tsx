import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)} data-testid="breadcrumb">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        data-testid="breadcrumb-home"
      >
        <Home className="h-4 w-4" />
      </button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground" data-testid={`breadcrumb-item-${index}`}>
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`breadcrumb-item-${index}`}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
