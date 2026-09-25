import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BellRing,
  Boxes,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  History,
  Landmark,
  LayoutDashboard,
  ListChecks,
  BarChart3,
  LogOut,
  Menu,
  Smartphone,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { clearMoviCreditoSession, restoreMoviCreditoSession } from "../../utils/session";

const navigation = [
  { to: "/admin", label: "Inicio", icon: LayoutDashboard },
  { to: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardCheck },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/planes-financiamiento", label: "Planes", icon: Landmark },
  { to: "/admin/creditos", label: "Créditos", icon: CreditCard },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { to: "/admin/inventario", label: "Inventario de equipos", icon: Boxes },
  { to: "/admin/dispositivos", label: "Dispositivos financiados", icon: Smartphone },
  { to: "/admin/ordenes-dispositivo", label: "Órdenes de dispositivo", icon: ListChecks },
  { to: "/admin/cobranza", label: "Cobranza", icon: BellRing },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/admin/auditoria", label: "Auditoría", icon: History },
  { to: "/admin/seguridad", label: "Seguridad", icon: ShieldCheck },
];

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [token, setToken] = useState(() => sessionStorage.getItem("movicredito_token"));
  const storedUser = sessionStorage.getItem("movicredito_user");

  const user = useMemo(() => {
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }, [storedUser]);

  useEffect(() => {
    let active = true;
    void restoreMoviCreditoSession().then((restored) => {
      if (!active) return;
      setToken(restored);
      setAuthChecking(false);
    });
    return () => { active = false; };
  }, []);

  if (authChecking) return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-sm text-black/45">Restaurando sesión…</div>;
  if (!token) return <Navigate to="/login?reason=session-expired" replace />;

  const isActive = (to: string) =>
    to === "/admin" ? location.pathname === to : location.pathname.startsWith(to);

  const logout = async () => {
    try { await fetch(`${import.meta.env.VITE_API_URL || ""}/api/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    clearMoviCreditoSession();
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 shadow-sm shadow-blue-100/50 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between px-4 md:px-7">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="MoviCrédito" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="font-semibold tracking-[-0.025em]">MoviCrédito</p>
              <p className="text-[11px] font-medium text-blue-600/70">Control Center</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.fullName || "Administrador"}</p>
              <p className="text-[11px] capitalize text-black/35">{user?.role || "usuario"}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-blue-500/20">
              {(user?.fullName || "M").charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-full border border-black/10 bg-white p-2.5 text-black/70 md:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1680px]">
        <aside
          className={`${menuOpen ? "block" : "hidden"} fixed inset-x-0 top-[72px] z-40 max-h-[calc(100vh-72px)] overflow-y-auto border-b border-blue-100 bg-white p-4 md:sticky md:top-[72px] md:block md:h-[calc(100vh-72px)] md:w-72 md:shrink-0 md:border-b-0 md:border-r md:border-blue-100 md:bg-gradient-to-b md:from-white md:via-blue-50/70 md:to-indigo-50/70 md:p-5`}
        >
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600/70">Operación</p>
          <nav className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`group flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                  isActive(to) ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </span>
                {isActive(to) && <ChevronRight size={15} className="text-white/70" />}
              </Link>
            ))}
          </nav>

          <div className="mt-7 border-t border-blue-100 pt-5">
            <Link to="/" className="block rounded-2xl px-3.5 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm">
              Ver portal público
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-white hover:text-red-600 hover:shadow-sm"
            >
              <LogOut size={17} /> Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white/80 md:rounded-tl-[32px] md:shadow-[-18px_0_50px_-42px_rgba(37,99,235,0.55)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
