import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { apiFetch } from "../lib/api";
import type { Order } from "../lib/types";

type OrdersRes = {
  status: string;
  results: number;
  data: { orders: Order[] };
};

const statusColor: Record<string, string> = {
  PENDING: "text-amber-400",
  PAID: "text-emerald-400",
  PROCESSING: "text-sky-400",
  SHIPPED: "text-violet-400",
  DELIVERED: "text-emerald-300",
  CANCELLED: "text-zinc-500",
};

export function OrdersPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await apiFetch<OrdersRes>("/api/v1/order", { auth: true });
      return res.data.orders;
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
        {(error as Error).message}
      </p>
    );
  }

  const orders = data ?? [];

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
        <h1 className="font-display text-2xl font-bold text-white">No orders yet</h1>
        <p className="mt-2 text-zinc-500">When you check out, your orders show up here.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/orders/${o.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 transition hover:border-zinc-700"
            >
              <div>
                <p className="font-mono text-sm text-zinc-500">{o.id.slice(0, 8)}…</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${statusColor[o.status] ?? "text-zinc-400"}`}>
                  {o.status}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                  ${o.total.toFixed(2)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
