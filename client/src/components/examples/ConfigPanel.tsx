import { useState } from "react";
import { ConfigPanel } from "../ConfigPanel";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function ConfigPanelExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Settings className="h-4 w-4 mr-2" />
        Open Config
      </Button>
      <ConfigPanel
        open={open}
        onClose={() => setOpen(false)}
        pagesDir="./showcase/pages"
        componentsDir="./showcase/components"
        onSave={(pages, components) => {
          console.log("Saved:", { pages, components });
        }}
      />
    </>
  );
}
