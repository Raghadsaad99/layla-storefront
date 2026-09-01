export type BagLine = { id: number; price: number; quantity: number; size: string; selectedColor: string };

export function getBagCount(lines: Pick<BagLine, "quantity">[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function getBagSubtotal(lines: Pick<BagLine, "price" | "quantity">[]) {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}

export function filterStorefrontItems<T extends { name: string; color: string; category: string }>(items: T[], query: string, category: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const categoryMatch = category === "All pieces" || item.category === category;
    const queryMatch = !normalizedQuery || `${item.name} ${item.color} ${item.category}`.toLowerCase().includes(normalizedQuery);
    return categoryMatch && queryMatch;
  });
}

export function updateBagLineQuantity<T extends BagLine>(lines: T[], id: number, size: string, selectedColor: string, delta: number) {
  return lines.flatMap((line) => line.id === id && line.size === size && line.selectedColor === selectedColor
    ? (line.quantity + delta > 0 ? [{ ...line, quantity: line.quantity + delta }] : [])
    : [line]);
}

export function removeBagLine<T extends BagLine>(lines: T[], id: number, size: string, selectedColor: string) {
  return lines.filter((line) => !(line.id === id && line.size === size && line.selectedColor === selectedColor));
}
