import {
  BookOpen,
  Laptop,
  Package,
  Shirt,
  Sofa,
  Sparkles,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";

export const categoryMeta: Record<
  Category,
  { icon: LucideIcon; gradient: string; tint: string }
> = {
  textbooks: {
    icon: BookOpen,
    gradient: "from-amber-100 to-orange-50 dark:from-amber-950/70 dark:to-orange-950/40",
    tint: "text-amber-700 dark:text-amber-300",
  },
  electronics: {
    icon: Laptop,
    gradient: "from-sky-100 to-blue-50 dark:from-sky-950/70 dark:to-blue-950/40",
    tint: "text-sky-700 dark:text-sky-300",
  },
  furniture: {
    icon: Sofa,
    gradient:
      "from-emerald-100 to-green-50 dark:from-emerald-950/70 dark:to-green-950/40",
    tint: "text-emerald-700 dark:text-emerald-300",
  },
  clothing: {
    icon: Shirt,
    gradient: "from-rose-100 to-pink-50 dark:from-rose-950/70 dark:to-pink-950/40",
    tint: "text-rose-700 dark:text-rose-300",
  },
  tickets: {
    icon: Ticket,
    gradient:
      "from-teal-100 to-slate-50 dark:from-teal-950/70 dark:to-slate-950/40",
    tint: "text-teal-700 dark:text-teal-300",
  },
  beauty: {
    icon: Sparkles,
    gradient:
      "from-fuchsia-100 to-pink-50 dark:from-fuchsia-950/70 dark:to-pink-950/40",
    tint: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  food: {
    icon: Utensils,
    gradient:
      "from-orange-100 to-amber-50 dark:from-orange-950/70 dark:to-amber-950/40",
    tint: "text-orange-700 dark:text-orange-300",
  },
  other: {
    icon: Package,
    gradient: "from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-800",
    tint: "text-stone-600 dark:text-stone-300",
  },
};
