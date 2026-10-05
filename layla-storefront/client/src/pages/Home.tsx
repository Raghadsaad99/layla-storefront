import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Check,
  Instagram,
  Mail,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { removeBagLine, updateBagLineQuantity } from "@/lib/storefront";
import { productsData, translations, type Language, type Product } from "@/lib/i18n";

type BagItem = Product & {
  quantity: number;
  size: string;
  selectedColor: string;
  selectedColorAr?: string;
};

const assets = {
  hero: "/images/noor-hero.jpg",
  rose: "/images/noor-edit-rose.jpg",
  sage: "/images/noor-edit-sage.jpg",
  lilac: "/images/noor-edit-lilac.jpg",
  detail: "/images/noor-veil-detail.jpg",
};

export default function Home() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("layla-lang");
    if (saved === "en" || saved === "ar") return saved;
    return "ar"; // default to Arabic for Jordan
  });

  const isRtl = lang === "ar";
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("layla-lang", lang);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Featured");
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorAr, setSelectedColorAr] = useState("");
  const [favourites, setFavourites] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("layla-favourites") || "[]")
  );
  const [bag, setBag] = useState<BagItem[]>(() =>
    JSON.parse(localStorage.getItem("layla-bag") || "[]")
  );
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    localStorage.setItem("layla-favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem("layla-bag", JSON.stringify(bag));
  }, [bag]);

  const money = (value: number) => {
    return isRtl ? `${value} د.أ` : `${value} JOD`;
  };

  const visibleProducts = useMemo(() => {
    const filtered = productsData.filter((product) => {
      const matchesCategory =
        category === "All" ||
        (category === "Abayas" && product.category === "Abayas") ||
        (category === "Veils" && product.category === "Veils");

      const searchQuery = query.toLowerCase().trim();
      if (!searchQuery) return matchesCategory;

      const searchableText = `${product.name} ${product.nameAr} ${product.color} ${product.colorAr} ${product.category}`.toLowerCase();
      return matchesCategory && searchableText.includes(searchQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return a.id - b.id;
    });
  }, [category, query, sort]);

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCost = subtotal >= 50 ? 0 : 3;

  const toggleFavourite = (id: number) => {
    setFavourites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const addToBag = (
    product: Product,
    size = product.sizes[0],
    color = product.colors[0]?.name,
    colorAr = product.colors[0]?.nameAr
  ) => {
    setBag((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === size && item.selectedColor === color
      );
      return existing
        ? current.map((item) =>
            item === existing ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...current,
            {
              ...product,
              size,
              selectedColor: color,
              selectedColorAr: colorAr,
              quantity: 1,
            },
          ];
    });
    toast.success(
      isRtl
        ? `تمت إضافة ${product.nameAr} إلى حقيبتك`
        : `${product.name} added to your bag`
    );
  };

  const updateQuantity = (id: number, size: string, color: string, delta: number) => {
    setBag((current) => updateBagLineQuantity(current, id, size, color, delta));
  };

  const removeFromBag = (id: number, size: string, color: string) => {
    setBag((current) => removeBagLine(current, id, size, color));
  };

  const openDetails = (product: Product) => {
    setDetailProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]?.name || product.color);
    setSelectedColorAr(product.colors[0]?.nameAr || product.colorAr);
  };

  const submitNewsletter = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      return toast.error(
        isRtl ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address"
      );
    }
    setSubscribed(true);
    toast.success(
      isRtl ? "أهلاً بكِ في قائمة ليلى البريدية" : "Welcome to the Layla list"
    );
  };

  const orderViaWhatsApp = () => {
    if (bag.length === 0) return;
    const itemsText = bag
      .map((item) => {
        const name = isRtl ? item.nameAr : item.name;
        const colorName = isRtl ? (item.selectedColorAr || item.selectedColor) : item.selectedColor;
        return `• ${name} (${colorName}، ${isRtl ? "المقاس" : "Size"} ${item.size}) × ${item.quantity} — ${money(item.price * item.quantity)}`;
      })
      .join("%0A");

    const deliveryText = subtotal >= 50 ? t.bag.deliveryComp : money(3);
    const total = subtotal + deliveryCost;

    const message = isRtl
      ? `مرحباً ليلى،%0A%0Aأود طلب القطع التالية:%0A%0A${itemsText}%0A%0Aالمجموع الفرعي: ${money(subtotal)}%0Aالتوصيل: ${deliveryText}%0Aالمجموع الإجمالي: ${money(total)}%0A%0Aيرجى تأكيد التوفر وموعد التوصيل داخل الأردن.`
      : `Hello Layla,%0A%0AI would like to order the following pieces:%0A%0A${itemsText}%0A%0ASubtotal: ${money(subtotal)}%0ADelivery: ${deliveryText}%0AEstimated Total: ${money(total)}%0A%0APlease confirm availability and delivery in Jordan.`;

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#31322d] selection:bg-[#d8abb3] selection:text-white">
      {/* Announcement Bar */}
      <div className="bg-[#31322d] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f8ede8]">
        {t.announcement}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#31322d]/10 bg-[#fbf8f3]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </Button>

          <a href="#top" className="font-serif text-2xl tracking-[-0.04em] lg:text-3xl">
            {t.brand}
          </a>

          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] lg:flex">
            <a href="#shop" className="transition-colors hover:text-[#b77f8a]">
              {t.nav.shop}
            </a>
            <a href="#edits" className="transition-colors hover:text-[#b77f8a]">
              {t.nav.edits}
            </a>
            <a href="#materials" className="transition-colors hover:text-[#b77f8a]">
              {t.nav.materials}
            </a>
            <a href="#journal" className="transition-colors hover:text-[#b77f8a]">
              {t.nav.journal}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 rounded-full border border-[#31322d]/20 px-3 py-1.5 text-[11px] font-medium transition-colors hover:border-[#b77f8a] hover:text-[#b77f8a]"
              title="Change Language / تغيير اللغة"
            >
              <Globe size={13} />
              <span>{t.switchLang}</span>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => document.getElementById("shop-search")?.focus()}
              aria-label="Search"
            >
              <Search size={19} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBagOpen(true)}
              aria-label="Open shopping bag"
              className="relative"
            >
              <ShoppingBag size={19} />
              {bagCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b77f8a] px-1 text-[9px] text-white">
                  {bagCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="relative min-h-[620px] overflow-hidden bg-[#dfe8e0] lg:min-h-[680px]">
          <img
            src={assets.hero}
            alt="Model in a flowing pastel abaya and veil"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? "from-transparent via-[#fbf8f3]/55 to-[#fbf8f3]/95" : "from-[#fbf8f3]/95 via-[#fbf8f3]/55 to-transparent"}`} />
          <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-20 lg:min-h-[680px] lg:px-10">
            <div className="max-w-xl">
              <p className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#b77f8a]">
                <Sparkles size={14} /> {t.hero.season}
              </p>
              <h1 className="font-serif text-6xl leading-[1.05] tracking-[-0.04em] text-[#31322d] sm:text-8xl">
                {t.hero.title1}
                <br />
                <em className="font-light">{t.hero.title2}</em>
              </h1>
              <p className="mt-7 max-w-sm text-base leading-7 text-[#31322d]/70">
                {t.hero.desc}
              </p>
              <a href="#shop">
                <Button className="mt-9 rounded-full bg-[#31322d] px-7 py-6 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-[#b77f8a]">
                  {t.hero.cta} <ArrowIcon size={15} />
                </Button>
              </a>
            </div>
          </div>
          <div className={`absolute bottom-8 ${isRtl ? "left-8 text-left" : "right-8 text-right"} hidden whitespace-pre-line text-[10px] uppercase tracking-[0.2em] text-[#31322d]/60 lg:block`}>
            {t.hero.badge}
          </div>
        </section>

        {/* The Edits */}
        <section id="edits" className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b77f8a]">
                {t.edits.tag}
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
                {t.edits.title}
              </h2>
            </div>
            <a
              href="#shop"
              className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] underline underline-offset-4 sm:flex"
            >
              {t.edits.shopAll} <ArrowIcon size={14} />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <a
              href="#shop"
              onClick={() => setCategory("Abayas")}
              className="group relative aspect-[4/5] overflow-hidden bg-[#ead7d7]"
            >
              <img
                src={assets.rose}
                alt="Rosewater abaya edit"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#31322d]/60 to-transparent p-6 pt-20 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em]">{t.edits.edit1Tag}</p>
                <p className="mt-2 font-serif text-2xl">{t.edits.edit1Title}</p>
              </div>
            </a>
            <a
              href="#shop"
              onClick={() => setCategory("Abayas")}
              className="group relative aspect-[4/5] overflow-hidden bg-[#dfe8e0]"
            >
              <img
                src={assets.sage}
                alt="Sage abaya edit"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#31322d]/60 to-transparent p-6 pt-20 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em]">{t.edits.edit2Tag}</p>
                <p className="mt-2 font-serif text-2xl">{t.edits.edit2Title}</p>
              </div>
            </a>
            <a
              href="#shop"
              onClick={() => setCategory("Veils")}
              className="group relative aspect-[4/5] overflow-hidden bg-[#e1d9e7]"
            >
              <img
                src={assets.lilac}
                alt="Lilac veil edit"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#31322d]/60 to-transparent p-6 pt-20 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em]">{t.edits.edit3Tag}</p>
                <p className="mt-2 font-serif text-2xl">{t.edits.edit3Title}</p>
              </div>
            </a>
          </div>
        </section>

        {/* Collection / Shop */}
        <section
          id="shop"
          className="border-y border-[#31322d]/10 bg-[#f4ede7] px-5 py-20 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b77f8a]">
                  {t.shop.tag}
                </p>
                <h2 className="font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
                  {t.shop.title}
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={15}
                    className={`absolute top-3.5 text-[#31322d]/45 ${isRtl ? "right-4" : "left-4"}`}
                  />
                  <Input
                    id="shop-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t.shop.searchPlaceholder}
                    className={`h-11 w-full rounded-full border-[#31322d]/15 bg-[#fbf8f3] text-sm sm:w-60 ${isRtl ? "pr-10" : "pl-10"}`}
                  />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#31322d]/15 bg-[#fbf8f3] px-4">
                  <SlidersHorizontal size={14} />
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-10 bg-transparent text-[11px] font-semibold uppercase tracking-[0.1em] outline-none"
                  >
                    <option value="Featured">{t.shop.sortFeatured}</option>
                    <option value="low">{t.shop.sortLowHigh}</option>
                    <option value="high">{t.shop.sortHighLow}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
              {[
                { key: "All", label: t.shop.catAll },
                { key: "Abayas", label: t.shop.catAbayas },
                { key: "Veils", label: t.shop.catVeils },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCategory(item.key)}
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                    category === item.key
                      ? "border-[#31322d] bg-[#31322d] text-white"
                      : "border-[#31322d]/20 hover:border-[#31322d]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {visibleProducts.map((product) => {
                const prodName = isRtl ? product.nameAr : product.name;
                const prodColor = isRtl ? product.colorAr : product.color;
                const prodBadge = isRtl ? product.badgeAr : product.badge;

                return (
                  <article key={product.id} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e1d9]">
                      <img
                        src={product.image}
                        alt={prodName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => toggleFavourite(product.id)}
                        className={`absolute top-3 rounded-full bg-[#fbf8f3]/85 p-2.5 backdrop-blur-sm transition-transform hover:scale-110 ${isRtl ? "left-3" : "right-3"}`}
                        aria-label="Toggle favourite"
                      >
                        <Heart
                          size={16}
                          className={
                            favourites.includes(product.id)
                              ? "fill-[#b77f8a] text-[#b77f8a]"
                              : "text-[#31322d]"
                          }
                        />
                      </button>
                      {prodBadge && (
                        <span
                          className={`absolute top-3 bg-[#fbf8f3] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${isRtl ? "right-3" : "left-3"}`}
                        >
                          {prodBadge}
                        </span>
                      )}
                      <button
                        onClick={() => addToBag(product)}
                        className="absolute inset-x-3 bottom-3 translate-y-12 rounded-full bg-[#31322d] py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {t.shop.quickAdd}
                      </button>
                    </div>

                    <button onClick={() => openDetails(product)} className="mt-4 text-left rtl:text-right w-full">
                      <p className="font-serif text-xl tracking-[-0.02em]">{prodName}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          {product.colors.map((variant) => (
                            <span
                              key={variant.name}
                              title={isRtl ? variant.nameAr : variant.name}
                              className="h-3 w-3 rounded-full border border-[#fbf8f3] ring-1 ring-[#31322d]/20"
                              style={{ backgroundColor: variant.tone }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#31322d]/60">
                          {prodColor} · {money(product.price)}
                        </p>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>

            {visibleProducts.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-serif text-3xl">{t.shop.emptyTitle}</p>
                <p className="mt-2 text-sm text-[#31322d]/60">{t.shop.emptyDesc}</p>
              </div>
            )}
          </div>
        </section>

        {/* Materials */}
        <section
          id="materials"
          className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:py-28"
        >
          <div className="overflow-hidden bg-[#eee3d7]">
            <img
              src={assets.detail}
              alt="Close-up of Layla fabric"
              className="aspect-[3/2] h-full w-full object-cover"
            />
          </div>
          <div className={`max-w-lg ${isRtl ? "lg:pr-8" : "lg:pl-8"}`}>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b77f8a]">
              {t.materials.tag}
            </p>
            <h2 className="font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
              {t.materials.title}
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#31322d]/70">
              {t.materials.desc}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[#31322d]/15 pt-7">
              <div>
                <p className="font-serif text-xl">{t.materials.f1Num}</p>
                <p className="mt-2 text-xs leading-5 text-[#31322d]/60">{t.materials.f1Text}</p>
              </div>
              <div>
                <p className="font-serif text-xl">{t.materials.f2Num}</p>
                <p className="mt-2 text-xs leading-5 text-[#31322d]/60">{t.materials.f2Text}</p>
              </div>
              <div>
                <p className="font-serif text-xl">{t.materials.f3Num}</p>
                <p className="mt-2 text-xs leading-5 text-[#31322d]/60">{t.materials.f3Text}</p>
              </div>
              <div>
                <p className="font-serif text-xl">{t.materials.f4Num}</p>
                <p className="mt-2 text-xs leading-5 text-[#31322d]/60">{t.materials.f4Text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Journal / Newsletter */}
        <section id="journal" className="bg-[#dfe8e0] px-5 py-20 text-center lg:px-10 lg:py-24">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b77f8a]">
            {t.journal.tag}
          </p>
          <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
            {t.journal.title}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#31322d]/70">
            {t.journal.desc}
          </p>
          <form
            onSubmit={submitNewsletter}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.journal.placeholder}
              disabled={subscribed}
              className="h-12 rounded-full border-[#31322d]/20 bg-[#fbf8f3] px-5"
            />
            <Button
              type="submit"
              disabled={subscribed}
              className="h-12 rounded-full bg-[#31322d] px-6 text-[10px] uppercase tracking-[0.18em] text-white hover:bg-[#b77f8a]"
            >
              {subscribed ? (
                <>
                  <Check size={14} /> {t.journal.joined}
                </>
              ) : (
                t.journal.button
              )}
            </Button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#31322d] px-5 py-12 text-[#f8ede8] lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-3xl">{t.footer.brand}</p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-[#f8ede8]/60">
              {t.footer.desc}
            </p>
          </div>
          <div className="flex gap-5">
            <a href="#top" aria-label="Instagram" className="transition-colors hover:text-[#d8abb3]">
              <Instagram size={18} />
            </a>
            <a href="#journal" aria-label="Newsletter" className="transition-colors hover:text-[#d8abb3]">
              <Mail size={18} />
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-[#f8ede8]/15 pt-5 text-[10px] uppercase tracking-[0.16em] text-[#f8ede8]/45 sm:flex-row sm:justify-between">
          <span>{t.footer.rights}</span>
          <span>{t.footer.tagline}</span>
        </div>
      </footer>

      {/* Mobile Menu Drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side={isRtl ? "right" : "left"} className="bg-[#fbf8f3]">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">{t.brand}</SheetTitle>
          </SheetHeader>
          <nav className="mt-12 flex flex-col gap-6 font-serif text-3xl">
            <a href="#shop" onClick={() => setMenuOpen(false)}>
              {t.nav.shop}
            </a>
            <a href="#edits" onClick={() => setMenuOpen(false)}>
              {t.nav.edits}
            </a>
            <a href="#materials" onClick={() => setMenuOpen(false)}>
              {t.nav.materials}
            </a>
            <a href="#journal" onClick={() => setMenuOpen(false)}>
              {t.nav.journal}
            </a>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Shopping Bag Drawer */}
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="flex w-full flex-col bg-[#fbf8f3] sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between font-serif text-2xl">
              <span>{t.bag.title}</span>
              <span className="font-sans text-xs font-normal text-[#31322d]/50">
                {bagCount} {bagCount === 1 ? t.bag.itemSingle : t.bag.itemPlural}
              </span>
            </SheetTitle>
          </SheetHeader>

          {bag.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ShoppingBag size={30} strokeWidth={1} />
              <p className="mt-5 font-serif text-2xl">{t.bag.emptyTitle}</p>
              <p className="mt-2 text-sm text-[#31322d]/60">{t.bag.emptyDesc}</p>
              <Button
                onClick={() => {
                  setBagOpen(false);
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-7 rounded-full bg-[#31322d] px-6 text-xs uppercase tracking-[0.16em] text-white"
              >
                {t.bag.shopBtn}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-5 overflow-y-auto py-8">
                {bag.map((item) => {
                  const itemName = isRtl ? item.nameAr : item.name;
                  const itemColor = isRtl
                    ? item.selectedColorAr || item.selectedColor
                    : item.selectedColor;

                  return (
                    <div
                      key={`${item.id}-${item.size}-${item.selectedColor}`}
                      className="flex gap-4"
                    >
                      <img
                        src={item.image}
                        alt={itemName}
                        className="h-28 w-24 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-serif text-lg">{itemName}</p>
                            <p className="mt-1 text-xs text-[#31322d]/60">
                              {itemColor} · {t.details.size} {item.size}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            {money(item.price * item.quantity)}
                          </p>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                          <button
                            onClick={() =>
                              removeFromBag(item.id, item.size, item.selectedColor)
                            }
                            className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b77f8a] underline underline-offset-4 ${isRtl ? "mr-auto" : "ml-auto"}`}
                          >
                            {t.bag.remove}
                          </button>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.selectedColor, -1)
                            }
                            className="rounded-full border border-[#31322d]/20 p-1"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.selectedColor, 1)
                            }
                            className="rounded-full border border-[#31322d]/20 p-1"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#31322d]/15 pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#31322d]/65">{t.bag.subtotal}</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#31322d]/65">{t.bag.delivery}</span>
                    <span>{subtotal >= 50 ? t.bag.deliveryComp : money(3)}</span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-[#31322d]/15 pt-4 font-serif text-xl">
                    <span>{t.bag.total}</span>
                    <span className="font-semibold">{money(subtotal + deliveryCost)}</span>
                  </div>
                </div>

                <p className="mt-3 text-center text-xs leading-relaxed text-[#31322d]/65">
                  {t.bag.note}
                </p>

                <Button
                  onClick={orderViaWhatsApp}
                  className="mt-5 h-12 w-full rounded-full bg-[#31322d] text-[10px] uppercase tracking-[0.18em] text-white hover:bg-[#b77f8a]"
                >
                  {t.bag.whatsappBtn} <ArrowIcon size={14} />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      <Dialog
        open={!!detailProduct}
        onOpenChange={(open) => !open && setDetailProduct(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[#fbf8f3] sm:max-w-3xl">
          {detailProduct && (
            <div className="grid gap-7 sm:grid-cols-2">
              <img
                src={detailProduct.image}
                alt={isRtl ? detailProduct.nameAr : detailProduct.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="flex flex-col justify-center">
                <DialogHeader>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b77f8a]">
                    {isRtl
                      ? detailProduct.category === "Abayas"
                        ? "العبايات"
                        : "الطرح"
                      : detailProduct.category}
                  </p>
                  <DialogTitle className="font-serif text-4xl tracking-[-0.04em]">
                    {isRtl ? detailProduct.nameAr : detailProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <p className="mt-5 text-sm leading-7 text-[#31322d]/70">
                  {isRtl ? detailProduct.descriptionAr : detailProduct.description}
                </p>
                <p className="mt-5 font-serif text-2xl font-medium">
                  {money(detailProduct.price)}
                </p>

                {/* Color Selector */}
                <div className="mt-7">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {t.details.colour} · {isRtl ? selectedColorAr : selectedColor}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailProduct.colors.map((variant) => (
                      <button
                        key={variant.name}
                        onClick={() => {
                          setSelectedColor(variant.name);
                          setSelectedColorAr(variant.nameAr);
                        }}
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                          selectedColor === variant.name
                            ? "border-[#31322d] bg-[#31322d] text-white"
                            : "border-[#31322d]/20 hover:border-[#31322d]"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: variant.tone }}
                        />
                        {isRtl ? variant.nameAr : variant.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]">
                    {t.details.size}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 rounded-full border px-3 py-2 text-xs transition-colors ${
                          selectedSize === size
                            ? "border-[#31322d] bg-[#31322d] text-white"
                            : "border-[#31322d]/20 hover:border-[#31322d]"
                        }`}
                      >
                        {size === "One size" && isRtl ? t.details.oneSize : size}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    addToBag(detailProduct, selectedSize, selectedColor, selectedColorAr);
                    setDetailProduct(null);
                    setBagOpen(true);
                  }}
                  className="mt-8 h-12 rounded-full bg-[#31322d] text-[10px] uppercase tracking-[0.18em] text-white hover:bg-[#b77f8a]"
                >
                  {t.details.addBtn} <ShoppingBag size={14} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
