import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/types";

type ProductsRes = {
  status: string;
  data: { products: Product[] };
};

export function HomePage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const res = await apiFetch<ProductsRes>("/api/v1/products?limit=8&sortBy=createdAt&order=desc");
      return res.data.products;
    },
  });

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/30 px-6 py-16 sm:px-12 sm:py-20">
        <div className="relative max-w-xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400/90">
            Curated commerce
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Essentials that feel considered, not crowded.
          </h1>
          <p className="text-lg text-zinc-400">
            Browse the catalog, keep a cart in sync with the API, and place orders backed by your
            Prisma schema — all through a focused storefront UI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Browse shop
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/80"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">New arrivals</h2>
            <p className="mt-1 text-zinc-500">Latest products from your API</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            View all →
          </Link>
        </div>
        {isPending ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            Could not load products. Is the API running on port 3000?
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
