export const themes = [
  {
    id: "forest",
    name: "Forest",
    color: "#2f6b4f",
    darkColor: "#6ee7b7",
  },
  {
    id: "ocean",
    name: "Ocean",
    color: "#1d4ed8",
    darkColor: "#60a5fa",
  },
  {
    id: "ember",
    name: "Ember",
    color: "#c2410c",
    darkColor: "#fb923c",
  },
  {
    id: "plum",
    name: "Plum",
    color: "#7e22ce",
    darkColor: "#c084fc",
  },
  {
    id: "slate",
    name: "Slate",
    color: "#334155",
    darkColor: "#94a3b8",
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
export type Mode = "light" | "dark";

export const DEFAULT_THEME: ThemeId = "forest";
export const THEME_STORAGE_KEY = "square-theme";
export const MODE_STORAGE_KEY = "square-mode";
