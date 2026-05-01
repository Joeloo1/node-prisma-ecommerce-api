import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
  }`;

export function AdminPage() {
  const location = useLocation();
  if (location.pathname === "/admin") {
    return <Navigate to="/admin/products" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Admin</h1>
        <p className="mt-1 text-zinc-500">Manage products, users, categories, and orders.</p>
      </div>

      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-2"
        aria-label="Admin sections"
      >
        <NavLink to="/admin/products" className={tabClass}>
          Products
        </NavLink>
        <NavLink to="/admin/users" className={tabClass}>
          Users
        </NavLink>
        <NavLink to="/admin/categories" className={tabClass}>
          Categories
        </NavLink>
        <NavLink to="/admin/orders" className={tabClass}>
          Orders
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}

