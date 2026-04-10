import Link from "next/link";
import type { Category } from "@/types/shop";

type Props = {
  categories: Category[];
  activeSlug?: string;
};

export function CategoryFilter({ categories, activeSlug }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/tienda"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          !activeSlug
            ? "bg-brand text-white"
            : "bg-white text-brand ring-1 ring-brand/20 hover:bg-surface-ice"
        }`}
      >
        Todas
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/tienda?categoria=${encodeURIComponent(c.slug)}`}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeSlug === c.slug
              ? "bg-brand text-white"
              : "bg-white text-brand ring-1 ring-brand/20 hover:bg-surface-ice"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
