import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { ApiError, apiFetch } from "../lib/api";
import type { Order } from "../lib/types";

type OrderRes = { status: string; data: { order: Order } };

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await apiFetch<OrderRes>(`/api/v1/order/${id}`, { auth: true });
      return res.data.order;
    },
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/order/${id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (orderQuery.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="rounded-2xl border border-zinc-800 p-8 text-center">
        <p className="text-zinc-400">Order not found or you cannot view it.</p>
        <Link to="/orders" className="mt-4 inline-block text-emerald-400 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = orderQuery.data;
  const canCancel = order.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/orders" className="text-sm text-emerald-400 hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">Order detail</h1>
          <p className="mt-1 font-mono text-sm text-zinc-500">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
          <p className="mt-2 text-xl font-semibold text-white">{order.status}</p>
        </div>
      </div>

      <ul className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-zinc-400">
              Product <span className="font-mono text-zinc-500">{item.product_id.slice(0, 8)}…</span>
            </span>
            <span className="tabular-nums text-zinc-300">
              ×{item.quantity} @ ${item.price.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <span className="text-lg font-medium text-zinc-400">Total</span>
        <span className="text-2xl font-bold tabular-nums text-white">${order.total.toFixed(2)}</span>
      </div>

      {canCancel ? (
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
          <p className="text-sm text-amber-200/90">
            Pending orders can be cancelled from the API. This sends PATCH /api/v1/order/:id.
          </p>
          {cancelMutation.isError ? (
            <p className="mt-2 text-sm text-red-400">
              {cancelMutation.error instanceof ApiError
                ? cancelMutation.error.message
                : "Cancel failed"}
            </p>
          ) : null}
          <button
            type="button"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
            className="mt-3 rounded-lg border border-amber-700/60 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-950/40 disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
