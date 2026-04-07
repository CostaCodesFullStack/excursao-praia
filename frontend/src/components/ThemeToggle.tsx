import { MoonStar, SunMedium } from "lucide-react";

import Button from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="h-11 w-11 rounded-full p-0"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      icon={theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    >
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

