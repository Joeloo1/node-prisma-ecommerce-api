import { Link } from "react-router-dom";
import { productImageUrl } from "../lib/productImage";
import type { Product } from "../lib/types";

export function ProductCard({ product }: { product: Product }) {
  const categoryName =
    product.category && "name" in product.category ? product.category.name : null;
  const price =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/70">
      <Link to={`/products/${product.product_id}`} className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <img
          src={productImageUrl(product)}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {!product.availability && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
            Unavailable
          </span>
        )}
        {product.discount ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-semibold text-white">
            −{Math.round(product.discount)}%
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName ? (
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{categoryName}</p>
        ) : null}
        <Link
          to={`/products/${product.product_id}`}
          className="font-display text-lg font-semibold leading-snug text-white hover:text-emerald-400"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-xl font-semibold tabular-nums text-white">
              ${price.toFixed(2)}
              {product.unit ? (
                <span className="text-sm font-normal text-zinc-500"> / {product.unit}</span>
              ) : null}
            </p>
            {product.discount && product.discount > 0 ? (
              <p className="text-sm text-zinc-500 line-through">${product.price.toFixed(2)}</p>
            ) : null}
          </div>
          {product.rating != null ? (
            <span className="text-sm text-amber-400/90" aria-label={`Rating ${product.rating}`}>
              ★ {product.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
