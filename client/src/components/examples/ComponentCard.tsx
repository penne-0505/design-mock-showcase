import { ComponentCard } from "../ComponentCard";
import { Button } from "@/components/ui/button";

export default function ComponentCardExample() {
  return (
    <div className="w-72">
      <ComponentCard
        id="1"
        name="Button"
        path="components/ui/Button.tsx"
        preview={<Button size="sm">Click me</Button>}
        onClick={() => console.log("Component card clicked")}
      />
    </div>
  );
}
