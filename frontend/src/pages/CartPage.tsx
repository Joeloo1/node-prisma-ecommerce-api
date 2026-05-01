import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { ApiError, apiFetch } from "../lib/api";
import { productImageUrl } from "../lib/productImage";
import type { Cart } from "../lib/types";

type CartRes = { status: string; data: { cart: Cart } };

export function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await apiFetch<CartRes>("/api/v1/cart", { auth: true });
      return res.data.cart;
    },
  });

  const updateQty = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await apiFetch(`/api/v1/cart/items/${itemId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await apiFetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
        auth: true,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const placeOrder = useMutation({
    mutationFn: async (items: { product_id: string; quantity: number }[]) => {
      const res = await apiFetch<{ data: { order: { id: string } } }>("/api/v1/order", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ items }),
      });
      return res.data.order.id;
    },
    onSuccess: async () => {
      await apiFetch("/api/v1/cart", { method: "DELETE", auth: true });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (cartQuery.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
        {(cartQuery.error as Error).message}
      </p>
    );
  }

  const cart = cartQuery.data!;
  const items = cart.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="mt-2 text-zinc-500">Add something from the shop.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-white">Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((line) => (
            <li
              key={line.id}
              className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <Link
                to={`/products/${line.product.product_id}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900"
              >
                <img
                  src={productImageUrl(line.product)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${line.product.product_id}`}
                  className="font-medium text-white hover:text-emerald-400"
                >
                  {line.product.name}
                </Link>
                <p className="mt-1 text-sm tabular-nums text-zinc-500">
                  ${line.product.price.toFixed(2)} each
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-400">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={line.quantity}
                      onChange={(e) => {
                        const q = Math.max(1, Number(e.target.value) || 1);
                        updateQty.mutate({ itemId: line.id, quantity: q });
                      }}
                      className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem.mutate(line.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums text-white">
                  ${(line.product.price * line.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Summary</h2>
          <p className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="tabular-nums text-white">${subtotal.toFixed(2)}</span>
          </p>
          <p className="text-xs text-zinc-600">
            Checkout creates an order from cart lines and clears the cart (demo flow).
          </p>
          {placeOrder.isError ? (
            <p className="text-sm text-red-400">
              {placeOrder.error instanceof ApiError
                ? placeOrder.error.message
                : "Order failed"}
            </p>
          ) : null}
          <button
            type="button"
            disabled={placeOrder.isPending}
            onClick={() =>
              placeOrder.mutate(
                items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
                {
                  onSuccess: (orderId) => navigate(`/orders/${orderId}`),
                },
              )
            }
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {placeOrder.isPending ? "Placing order…" : "Place order"}
          </button>
          <Link
            to="/products"
            className="block text-center text-sm text-zinc-500 hover:text-zinc-300"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
