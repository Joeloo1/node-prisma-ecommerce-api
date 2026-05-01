import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Address } from "../lib/types";

type AddressesRes = {
  status: string;
  data: { address: Address[] };
};

type CreateAddressRes = {
  status: string;
  data: { Address: Address };
};

export function AccountAddressesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const addressesQuery = useQuery({
    queryKey: ["addresses", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await apiFetch<AddressesRes>("/api/v1/addresses", { auth: true });
      const raw = res.data.address;
      return Array.isArray(raw) ? raw : [];
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/v1/addresses/${id}`, { method: "DELETE", auth: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const createAddress = useMutation({
    mutationFn: async () => {
      const res = await apiFetch<CreateAddressRes>("/api/v1/addresses", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          street,
          city,
          state: state.trim() || undefined,
          zipCode: zipCode.trim() || undefined,
          country: country.trim() || undefined,
        }),
      });
      return res;
    },
    onSuccess: () => {
      setStreet("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (e) => {
      setFormError(e instanceof ApiError ? e.message : "Could not save address");
    },
  });

  function onAddAddress(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    createAddress.mutate();
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Addresses</h2>

      {addressesQuery.isError ? (
        <p className="mt-4 text-sm text-red-400">
          {addressesQuery.error instanceof Error
            ? addressesQuery.error.message
            : String(addressesQuery.error)}
        </p>
      ) : addressesQuery.isPending ? (
        <p className="mt-4 text-zinc-500">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {addressesQuery.data?.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="text-sm text-zinc-300">
                <p>{a.street}</p>
                <p>
                  {a.city}
                  {a.state ? `, ${a.state}` : ""} {a.zipCode ?? ""}
                </p>
                {a.country ? <p>{a.country}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => deleteAddress.mutate(a.id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
          {addressesQuery.data?.length === 0 ? (
            <p className="text-zinc-500">No saved addresses.</p>
          ) : null}
        </ul>
      )}

      <form onSubmit={onAddAddress} className="mt-8 space-y-3 border-t border-zinc-800 pt-8">
        <h3 className="text-sm font-medium text-white">Add address</h3>
        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
        <input
          required
          minLength={2}
          placeholder="Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        />
        <input
          required
          minLength={2}
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            placeholder="State (optional)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          />
          <input
            placeholder="ZIP (optional)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          />
          <input
            placeholder="Country (optional)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={createAddress.isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {createAddress.isPending ? "Saving…" : "Save address"}
        </button>
      </form>
    </section>
  );
}

