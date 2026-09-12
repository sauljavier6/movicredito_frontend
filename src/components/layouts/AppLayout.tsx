import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BellRing,
  Boxes,
  ClipboardCheck,
  CreditCard,
  History,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Smartphone,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { to: "/admin", label: "Inicio", icon: LayoutDashboard },
  { to: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardCheck },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/creditos", label: "Créditos", icon: CreditCard },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { to: "/admin/inventario", label: "Inventario", icon: Boxes },
  { to: "/admin/catalogo", label: "Catálogo", icon: PackageSearch },
  { to: "/admin/dispositivos", label: "Dispositivos", icon: Smartphone },
  { to: "/admin/cobranza", label: "Cobranza", icon: BellRing },
  { to: "/admin/auditoria", label: "Auditoría", icon: History },
];

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/admin" ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="MoviCrédito"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <p className="font-bold tracking-tight">MoviCrédito</p>
              <p className="text-xs text-slate-400">Administración</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-lg border border-slate-700 p-2 text-slate-200 md:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-800 bg-slate-950 p-4 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:w-64 md:shrink-0 md:border-b-0 md:border-r md:p-4`}
        >
          <nav className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive(to)
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <Link
              to="/"
              className="block rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Ver portal público
            </Link>
            <Link
              to="/login"
              className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              Cerrar sesión
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
