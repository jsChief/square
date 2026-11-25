import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category, Condition } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export const categoryLabels: Record<Category, string> = {
  textbooks: "Textbooks",
  electronics: "Electronics",
  furniture: "Furniture",
  clothing: "Clothing",
  tickets: "Tickets",
  beauty: "Beauty",
  food: "Food",
  other: "Other",
};

export const conditionLabels: Record<Condition, string> = {
  new: "Brand new",
  "like-new": "Like new",
  good: "Good",
  fair: "Fair",
  unknown: "Condition not listed",
};
