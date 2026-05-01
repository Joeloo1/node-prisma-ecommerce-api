import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { Spinner } from "../components/Spinner";
import { apiFetch } from "../lib/api";
import type { Category, Pagination, Product } from "../lib/types";

type ProductsRes = {
  status: string;
  data: { products: Product[] };
  pagination: Pagination;
};

type CategoriesRes = {
  status: string;
  data: { categories: Category[] };
};

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "12");
    if (search.trim()) p.set("name", search.trim());
    if (categoryId) p.set("category_id", categoryId);
    p.set("sortBy", sortBy);
    p.set("order", order);
    return p.toString();
  }, [page, search, categoryId, sortBy, order]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiFetch<CategoriesRes>("/api/v1/categories");
      return res.data.categories;
    },
  });

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["products", queryString],
    queryFn: async () => {
      const res = await apiFetch<ProductsRes>(`/api/v1/products?${queryString}`);
      return res;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Shop</h1>
        <p className="mt-1 text-zinc-500">Filter and paginate against live API query params</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-500">Search name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(name)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-600"
            placeholder="e.g. headphones"
          />
        </label>
        <label className="flex min-w-[160px] flex-col gap-1 text-sm">
          <span className="text-zinc-500">Category</span>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          >
            <option value="">All</option>
            {categories?.map((c) => (
              <option key={c.category_id} value={String(c.category_id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-col gap-1 text-sm">
          <span className="text-zinc-500">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="flex min-w-[120px] flex-col gap-1 text-sm">
          <span className="text-zinc-500">Order</span>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          >
            <option value="desc">High → low</option>
            <option value="asc">Low → high</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setSearch(name);
            setPage(1);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Apply
        </button>
      </div>

      {isPending ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
          {(error as Error).message}
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
          {data?.pagination && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-8"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={!data.pagination.hasPrev}
                onClick={() => setPage((x) => Math.max(1, x - 1))}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 text-sm text-zinc-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={!data.pagination.hasNext}
                onClick={() => setPage((x) => x + 1)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
