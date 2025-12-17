import { EmptyState } from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <EmptyState
      type="components"
      directory="./src/components"
      onConfigure={() => console.log("Configure clicked")}
    />
  );
}
