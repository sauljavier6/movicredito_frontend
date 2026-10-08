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
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import { clearMoviCreditoSession, restoreMoviCreditoSession } from "../../utils/session";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { io } from "socket.io-client";

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
  { to: "/admin/soporte", label: "Soporte", icon: MessageCircle },
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
  const [supportUnread, setSupportUnread] = useState(0);
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

  const loadSupportUnread = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const body = await response.json();
      const unread = (body.items || []).reduce(
        (total: number, ticket: { unread?: number }) => total + Number(ticket.unread || 0),
        0,
      );
      setSupportUnread(unread);
    } catch {}
  };

  useEffect(() => {
    if (token) void loadSupportUnread();
    const refresh = () => void loadSupportUnread();
    window.addEventListener("movicredito:support-read", refresh);
    return () => window.removeEventListener("movicredito:support-read", refresh);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    const onSupport = (event: { ticketId: string }) => {
      window.dispatchEvent(new CustomEvent("movicredito:support-changed", { detail: event }));
      void loadSupportUnread();
    };
    socket.on("support:changed", onSupport);
    socket.on("connect", () => {
      window.dispatchEvent(new Event("movicredito:support-connected"));
      void loadSupportUnread();
    });
    return () => { socket.disconnect(); };
  }, [token]);

  useAutoRefresh(loadSupportUnread, 30000);

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
            <Link
              to="/admin/soporte"
              className="relative mr-1 flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              aria-label={supportUnread > 0 ? `${supportUnread} mensaje(s) de soporte sin leer` : "Soporte"}
              title={supportUnread > 0 ? `${supportUnread} mensaje(s) de soporte sin leer` : "Soporte"}
            >
              <BellRing size={19} />
              {supportUnread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {supportUnread > 99 ? "99+" : supportUnread}
                </span>
              )}
            </Link>
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
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative shrink-0">
                    <Icon size={18} strokeWidth={1.8} />
                    {to === "/admin/soporte" && supportUnread > 0 && (
                      <span className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${isActive(to) ? "bg-white text-blue-700" : "bg-red-500 text-white"}`}>
                        {supportUnread > 99 ? "99+" : supportUnread}
                      </span>
                    )}
                  </span>
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
