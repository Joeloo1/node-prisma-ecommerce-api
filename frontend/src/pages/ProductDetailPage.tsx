import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch } from "../lib/api";
import { productImageUrl } from "../lib/productImage";
import type { Product, Review } from "../lib/types";

type ProductRes = { status: string; data: { product: Product } };
type ReviewsRes = { status: string; data: { reviews: Review[] } };

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await apiFetch<ProductRes>(`/api/v1/products/${id}`);
      return res.data.product;
    },
    enabled: Boolean(id),
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await apiFetch<ReviewsRes>(
        `/api/v1/reviews?product_id=${encodeURIComponent(id!)}`,
        { auth: true },
      );
      return res.data.reviews;
    },
    enabled: Boolean(id) && Boolean(user),
  });

  const addCart = useMutation({
    mutationFn: async () => {
      await apiFetch("/api/v1/cart/items", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ product_id: id, quantity: qty }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await apiFetch("/api/v1/reviews", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          product_id: id,
          rating,
          content: reviewText.trim() || undefined,
        }),
      });
    },
    onSuccess: () => {
      setFormError(null);
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: (e) => {
      setFormError(e instanceof ApiError ? e.message : "Could not submit review");
    },
  });

  const p = productQuery.data;
  const gallery = useMemo(() => {
    if (!p) return [];
    const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    if (p.image && !imgs.includes(p.image)) imgs.unshift(p.image);
    return imgs;
  }, [p]);

  useEffect(() => {
    if (!p) return;
    const first = gallery[0] ?? productImageUrl(p);
    setActiveImage(first);
  }, [p?.product_id, gallery]);

  if (productQuery.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (productQuery.isError || !p) {
    return (
      <div className="rounded-2xl border border-zinc-800 p-8 text-center">
        <p className="text-zinc-400">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-emerald-400 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const displayPrice =
    p.discount && p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
  const categoryName =
    p.category && "name" in p.category ? p.category.name : null;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <img
          src={activeImage ?? productImageUrl(p)}
          alt=""
          className="aspect-square w-full object-cover"
        />
      </div>
        {gallery.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {gallery.map((src) => {
              const isActive = src === activeImage;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className={`shrink-0 overflow-hidden rounded-xl border ${
                    isActive ? "border-emerald-500" : "border-zinc-800"
                  } bg-zinc-900/40`}
                  aria-label="View product image"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-20 w-20 object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="space-y-6">
        {categoryName ? (
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-500/90">{categoryName}</p>
        ) : null}
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{p.name}</h1>
        {p.brand ? <p className="text-zinc-500">{p.brand}</p> : null}
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-semibold tabular-nums text-white">${displayPrice.toFixed(2)}</span>
          {p.discount && p.discount > 0 ? (
            <span className="text-lg text-zinc-500 line-through">${p.price.toFixed(2)}</span>
          ) : null}
          {p.rating != null ? (
            <span className="text-amber-400">★ {p.rating.toFixed(1)}</span>
          ) : null}
        </div>
        {p.description ? (
          <p className="leading-relaxed text-zinc-400">{p.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-6">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            Qty
            <input
              type="number"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
            />
          </label>
          {user ? (
            <button
              type="button"
              disabled={!p.availability || addCart.isPending}
              onClick={() => addCart.mutate()}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {addCart.isPending ? "Adding…" : "Add to cart"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: `/products/${id}` } })}
              className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              Sign in to purchase
            </button>
          )}
        </div>
        {!p.availability ? (
          <p className="text-sm text-amber-200/90">This item is currently unavailable.</p>
        ) : null}
      </div>

      <section className="lg:col-span-2">
        <h2 className="font-display text-xl font-bold text-white">Reviews</h2>
        {!user ? (
          <p className="mt-2 text-zinc-500">
            <Link to="/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>{" "}
            to read and write reviews.
          </p>
        ) : (
          <>
            {reviewsQuery.isPending ? (
              <div className="mt-4 flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {reviewsQuery.data?.length ? (
                  reviewsQuery.data.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-white">
                          {r.user?.name ?? "Customer"}
                        </span>
                        <span className="text-amber-400">★ {r.rating}</span>
                      </div>
                      {r.content ? (
                        <p className="mt-2 text-zinc-400">{r.content}</p>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <p className="text-zinc-500">No reviews yet — be the first.</p>
                )}
              </ul>
            )}

            <form
              className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                reviewMutation.mutate();
              }}
            >
              <h3 className="font-medium text-white">Write a review</h3>
              {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
              <label className="flex max-w-xs flex-col gap-1 text-sm">
                <span className="text-zinc-500">Rating</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Comment (optional)</span>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                />
              </label>
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-50"
              >
                {reviewMutation.isPending ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
