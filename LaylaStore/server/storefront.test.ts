import { describe, expect, it } from "vitest";
import { filterStorefrontItems, getBagCount, getBagSubtotal, removeBagLine, updateBagLineQuantity } from "../client/src/lib/storefront";

describe("Noor Atelier storefront helpers", () => {
  it("calculates item count and subtotal for the persistent bag", () => {
    const lines = [{ id: 1, size: "S", selectedColor: "Rosewater", price: 185, quantity: 1 }, { id: 4, size: "One size", selectedColor: "Pearl", price: 48, quantity: 2 }];
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

  it("updates and removes only the requested colour variant", () => {
    const lines = [
      { id: 1, size: "S", selectedColor: "Rosewater", price: 185, quantity: 1 },
      { id: 1, size: "S", selectedColor: "Ivory", price: 185, quantity: 1 },
    ];
    const updated = updateBagLineQuantity(lines, 1, "S", "Rosewater", 1);
    expect(updated.find((line) => line.selectedColor === "Rosewater")?.quantity).toBe(2);
    expect(updated.find((line) => line.selectedColor === "Ivory")?.quantity).toBe(1);
    expect(removeBagLine(updated, 1, "S", "Ivory")).toHaveLength(1);
  });
});
