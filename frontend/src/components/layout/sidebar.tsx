
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  FlaskConical,
  ChartNoAxesCombined,
  Bookmark,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Trends", href: "/trends", icon: TrendingUp },
  { name: "Research", href: "/research", icon: FlaskConical },
  { name: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { name: "Saved", href: "/saved", icon: Bookmark },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200/10 bg-[#0A1024] p-4 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C50337]">
            <Sparkles size={22} />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                NYRA <span className="text-[#C50337]">PLUS</span>
              </h1>
              <p className="text-xs text-slate-400">
                Trend Intelligence
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      {!collapsed && (
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>
      )}

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          const selected =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              aria-current={selected ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                selected
                  ? "bg-[#C50337] font-semibold text-white shadow-lg shadow-[#C50337]/20"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-white/10 pt-4">
        <Link
          href="/settings"
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
            pathname === "/settings"
              ? "bg-[#C50337] font-semibold text-white"
              : "text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={19} />
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold">NYRA Intelligence</p>
            <p className="mt-1 text-xs text-slate-400">
              Discover what matters next.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
