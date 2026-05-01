import { Link } from "react-router-dom";

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/30 p-10 text-center">
      <h1 className="font-display text-3xl font-bold text-white">403</h1>
      <p className="mt-2 text-zinc-400">Admin access is required to view this page.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Go home
        </Link>
        <Link
          to="/account/profile"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
        >
          Account
        </Link>
      </div>
    </div>
  );
}

