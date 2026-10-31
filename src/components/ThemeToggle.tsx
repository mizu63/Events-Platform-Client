
"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
      title="Toggle theme"
      suppressHydrationWarning
    >
      <span className="text-3xl" suppressHydrationWarning>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
