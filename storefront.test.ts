import { describe, expect, it } from "vitest";
import { filterStorefrontItems, getBagCount, getBagSubtotal } from "./storefront";

describe("Noor Atelier storefront helpers", () => {
  it("calculates item count and subtotal for the persistent bag", () => {
    const lines = [{ price: 185, quantity: 1 }, { price: 48, quantity: 2 }];
    expect(getBagCount(lines)).toBe(3);
    expect(getBagSubtotal(lines)).toBe(281);
  });

  it("filters by category and a case-insensitive search term", () => {
    const items = [
      { name: "Miette Abaya", color: "Rosewater", category: "Abayas" },
      { name: "Everyday Veil", color: "Warm Ivory", category: "Veils" },
    ];
    expect(filterStorefrontItems(items, "rose", "All pieces")).toHaveLength(1);
    expect(filterStorefrontItems(items, "", "Veils")[0]?.name).toBe("Everyday Veil");
  });
});
