import { PageCard } from "../PageCard";

export default function PageCardExample() {
  return (
    <div className="w-80">
      <PageCard
        id="1"
        name="Landing Page Design"
        path="pages/landing/index.tsx"
        lastModified="Dec 15, 2024"
        onClick={() => console.log("Page card clicked")}
      />
    </div>
  );
}
