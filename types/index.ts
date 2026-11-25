export type Category =
  | "textbooks"
  | "electronics"
  | "furniture"
  | "clothing"
  | "tickets"
  | "beauty"
  | "food"
  | "other";

export type Condition = "new" | "like-new" | "good" | "fair" | "unknown";

export interface Seller {
  id: string;
  name: string;
  campus: string;
  rating: number | null;
}

export interface Listing {
  id: string;
  productId: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  location: string;
  createdAt: string;
  images: string[];
  seller: Seller;
  /** IDs and flags needed to place an order against this listing. */
  storeId: number | null;
  sellerId: string | null;
  storeName: string;
  storeLogoUrl: string | null;
  stock: number | null;
  status: string;
  isBlocked: boolean;
}
