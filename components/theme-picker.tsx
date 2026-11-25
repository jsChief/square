"use client";

import { useRef } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { themes, type Mode } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

const modes: { id: Mode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export function ThemePicker({ inline = false }: { inline?: boolean }) {
  const { theme, setTheme, mode, setMode } = useTheme();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function selectTheme(id: (typeof themes)[number]["id"]) {
    setTheme(id);
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function selectMode(next: Mode) {
    setMode(next);
  }

  const controls = (
    <>
      <div>
        <p className="px-1 pb-2 text-xs font-medium text-muted">
          {inline ? "Color mode" : "Appearance"}
        </p>
        <div
          className={cn(
            "grid grid-cols-2 gap-1 rounded-xl bg-background p-1",
            inline && "gap-2 p-1.5",
          )}
        >
          {modes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectMode(id)}
              aria-pressed={mode === id}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg transition-colors",
                inline ? "px-3 py-2.5 text-sm" : "px-2 py-2 text-xs",
                mode === id
                  ? "bg-surface font-medium text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "border-t border-line pt-3",
          inline ? "mt-6" : "mt-4",
        )}
      >
        <p className="px-1 pb-2 text-xs font-medium text-muted">Accent color</p>
        <div className="grid gap-1">
          {themes.map((option) => {
            const active = theme === option.id;
            const swatch = mode === "dark" ? option.darkColor : option.color;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectTheme(option.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg text-left text-sm transition-colors hover:bg-background",
                  inline ? "px-3 py-3" : "px-2 py-2",
                  active && "bg-background font-medium",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 rounded-full ring-offset-2 ring-offset-surface",
                    inline ? "size-5" : "size-4",
                    active && "ring-2 ring-accent",
                  )}
                  style={{ backgroundColor: swatch }}
                />
                {option.name}
                {active && (
                  <Check
                    className="ml-auto size-4 text-accent"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (inline) return <div>{controls}</div>;

  return (
    <details ref={detailsRef} className="relative">
      <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
        <Palette className="size-4" aria-hidden="true" />
        <span className="sr-only">Appearance settings</span>
      </summary>

      <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-line bg-surface p-3 shadow-xl">
        {controls}
      </div>
    </details>
  );
}
