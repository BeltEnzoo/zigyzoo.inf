import Link from "next/link";
import { buildTiendaHref } from "@/lib/shop/tienda-href";
import type { Category } from "@/types/shop";

type Props = {
  categories: Category[];
  activeSlug?: string;
  /** Conservar búsqueda y filtros de variante al cambiar categoría */
  preserve?: { q?: string; color?: string; tamano?: string };
};

export function CategoryFilter({ categories, activeSlug, preserve }: Props) {
  function categoryStyle(hex: string | null | undefined, active: boolean) {
    const color = hex?.trim();
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return undefined;
    if (active) {
      return {
        backgroundColor: color,
        borderColor: color,
        color: "#111827",
      };
    }
    return {
      borderColor: color,
      color,
    };
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildTiendaHref({
          q: preserve?.q,
          color: preserve?.color,
          tamano: preserve?.tamano,
        })}
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
          href={buildTiendaHref({
            categoria: c.slug,
            q: preserve?.q,
            color: preserve?.color,
            tamano: preserve?.tamano,
          })}
          style={categoryStyle(c.color_hex, activeSlug === c.slug)}
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
