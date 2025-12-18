import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getPreferredTheme, persistTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const preferred = getPreferredTheme();
    setIsDark(preferred === "dark");
    applyTheme(preferred);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const nextTheme = next ? "dark" : "light";
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
