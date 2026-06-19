import { NavLink, Outlet } from "react-router-dom";
import { FileText, History, Home, MessageSquare, Mic2, Settings, UserRoundCheck } from "lucide-react";

import { cn } from "../../lib/utils";
import { useSettings } from "../../contexts/SettingsContext";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/interview", label: "Interview", icon: UserRoundCheck },
  { to: "/pdf", label: "PDF", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell() {
  const { settings, modes } = useSettings();
  const currentMode = modes.find((mode) => mode.id === settings.currentMode);

  return (
    <div className="app-shell min-h-screen">
      <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 border-r backdrop-blur-xl md:block">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <Mic2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Nova</h1>
              <p className="muted text-xs">AI Voice Assistant</p>
            </div>
          </div>
        </div>
        <nav className="grid gap-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive && "nav-item-active")
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="app-header sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl md:ml-64 md:px-8">
        <div className="flex items-center gap-3 md:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300">
            <Mic2 size={19} />
          </div>
          <span className="font-semibold tracking-tight">Nova</span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{currentMode?.name ?? "General Assistant"}</p>
          <p className="muted text-xs">{settings.language}</p>
        </div>
        <NavLink to="/settings" className="nav-icon rounded-xl p-2 transition" title="Settings">
          <Settings size={19} />
        </NavLink>
      </header>

      <main className="min-h-[calc(100vh-4rem)] px-4 py-6 pb-24 md:ml-64 md:px-8 md:pb-8">
        <Outlet />
      </main>

      <nav className="app-mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t backdrop-blur-xl md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              cn("mobile-nav-item flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px]", isActive && "mobile-nav-item-active")
            }
          >
            <item.icon size={18} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
