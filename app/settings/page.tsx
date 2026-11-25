import type { Metadata } from "next";
import { Palette } from "lucide-react";
import { ThemePicker } from "@/components/theme-picker";

export const metadata: Metadata = {
  title: "Settings — square",
  description: "Choose your color mode and accent color on square.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Preferences
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Make square feel like yours. Your appearance preferences are saved on
          this device.
        </p>
      </header>

      <section
        aria-labelledby="appearance-heading"
        className="mt-8 rounded-3xl border border-line bg-surface p-5 sm:p-7"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Palette className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="appearance-heading" className="text-base font-semibold">
              Appearance
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Switch between light and dark mode, then choose an accent color.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <ThemePicker inline />
        </div>
      </section>
    </div>
  );
}
