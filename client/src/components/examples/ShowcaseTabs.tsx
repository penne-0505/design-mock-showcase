import { useState } from "react";
import { ShowcaseTabs } from "../ShowcaseTabs";

export default function ShowcaseTabsExample() {
  const [activeTab, setActiveTab] = useState<"pages" | "components">("pages");
  return (
    <ShowcaseTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pagesCount={5}
      componentsCount={12}
    />
  );
}
