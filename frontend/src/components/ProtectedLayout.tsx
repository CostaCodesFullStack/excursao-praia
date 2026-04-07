import { toast } from "sonner";
import { BusFront, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Resumo", icon: LayoutDashboard, end: true },
  { to: "/bus", label: "Onibus", icon: BusFront },
  { to: "/passengers", label: "Passageiros", icon: UsersRound },
];

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const logout = useLogout();

  if (currentUser.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="panel w-full max-w-md p-8 text-center">
          <p className="font-display text-3xl tracking-tight text-foreground">Carregando painel</p>
          <p className="mt-3 text-sm text-muted-foreground">Validando sua sessao e preparando os dados da excursao.</p>
        </div>
      </div>
    );
  }

  if (!currentUser.data) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/login", { replace: true });
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_55%)]" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">Excursao Control</p>
            <p className="truncate text-sm text-muted-foreground">{currentUser.data.email}</p>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    isActive ? "bg-accent text-accent-foreground" : "bg-muted text-foreground hover:bg-muted/80",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-4 bottom-4 z-20 rounded-[1.75rem] border border-border/70 bg-panel/95 p-2 shadow-soft backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-xs font-semibold transition",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full rounded-2xl sm:hidden"
          icon={<LogOut className="h-4 w-4" />}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </nav>
    </div>
  );
}
