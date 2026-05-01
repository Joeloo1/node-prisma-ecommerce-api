import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError, apiFetch } from "../../lib/api";

export function AdminOrdersPage() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("PROCESSING");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: async () => {
      setErrorText(null);
      setSuccessText(null);
      await apiFetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => setSuccessText("Order status updated."),
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Update failed"),
  });

  const cancelOrder = useMutation({
    mutationFn: async () => {
      setErrorText(null);
      setSuccessText(null);
      await apiFetch(`/api/v1/admin/orders/${orderId}/cancel`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => setSuccessText("Order cancelled."),
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Cancel failed"),
  });

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Orders</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Admin order routes in this API are action-based. Enter an order ID to update status or cancel.
      </p>

      {errorText ? <p className="mt-3 text-sm text-red-400">{errorText}</p> : null}
      {successText ? <p className="mt-3 text-sm text-emerald-400">{successText}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID"
          className="sm:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!orderId.trim() || updateStatus.isPending}
          onClick={() => updateStatus.mutate()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {updateStatus.isPending ? "Updating…" : "Update status"}
        </button>
        <button
          type="button"
          disabled={!orderId.trim() || cancelOrder.isPending}
          onClick={() => cancelOrder.mutate()}
          className="rounded-lg border border-amber-700/60 bg-amber-950/20 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-950/40 disabled:opacity-50"
        >
          {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
        </button>
      </div>
    </section>
  );
}

