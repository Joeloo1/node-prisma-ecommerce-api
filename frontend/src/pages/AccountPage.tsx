import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
  }`;

export function AccountPage() {
  const location = useLocation();
  const atRoot = location.pathname === "/account";

  if (atRoot) {
    return <Navigate to="/account/profile" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Account</h1>
        <p className="mt-1 text-zinc-500">Manage your profile and saved addresses.</p>
      </div>

      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-2"
        aria-label="Account sections"
      >
        <NavLink to="/account/profile" className={tabClass}>
          Profile
        </NavLink>
        <NavLink to="/account/addresses" className={tabClass}>
          Addresses
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
