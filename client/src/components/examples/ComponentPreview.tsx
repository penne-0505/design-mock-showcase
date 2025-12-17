import { ComponentPreview } from "../ComponentPreview";
import { Button } from "@/components/ui/button";

export default function ComponentPreviewExample() {
  return (
    <div className="h-[400px] border rounded-md overflow-hidden">
      <ComponentPreview
        name="Button"
        path="components/ui/Button.tsx"
        component={
          <div className="flex gap-4 flex-wrap">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        }
        onBack={() => console.log("Back clicked")}
        breadcrumbItems={[
          { label: "Components", onClick: () => console.log("Components") },
          { label: "ui", onClick: () => console.log("ui") },
          { label: "Button" },
        ]}
      />
    </div>
  );
}
