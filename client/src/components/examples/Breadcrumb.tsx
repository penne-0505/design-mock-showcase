import { Breadcrumb } from "../Breadcrumb";

export default function BreadcrumbExample() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", onClick: () => console.log("Home clicked") },
        { label: "Components", onClick: () => console.log("Components clicked") },
        { label: "Button.tsx" },
      ]}
    />
  );
}
