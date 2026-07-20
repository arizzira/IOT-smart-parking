import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, History, CarFront, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  const navs = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Manajemen User', path: '/users', icon: <Users size={18} /> },
    { name: 'Riwayat Log', path: '/logs', icon: <History size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">

      {/* Decorative background gradient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-indigo-50/80 blur-2xl" />
      </div>

      {/* SIDEBAR */}
      <aside
        className={`relative z-10 flex flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 ease-in-out hidden md:flex ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
          <div className="p-2 bg-blue-600 rounded-xl flex-shrink-0">
            <CarFront className="text-white" size={20} />
          </div>
          {!collapsed && (
            <h1 className="font-semibold text-base tracking-wide text-slate-800 transition-opacity duration-200">
              SMART<span className="text-blue-600">PARK</span>
            </h1>
          )}
        </div>

        {/* Nav items */}
        <nav className="p-3 flex-1 space-y-1">
          {navs.map((nav) => (
            <NavLink
              key={nav.name}
              to={nav.path}
              title={collapsed ? nav.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0">{nav.icon}</span>
              {!collapsed && <span>{nav.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center leading-relaxed">
            v2.0 · Kelompok 14<br />TI 2 Semester 6
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-600 transition-colors duration-200"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-8">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Smart Parking</p>
            <h2 className="font-medium text-slate-800 leading-tight">Panel Admin Terpadu</h2>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-emerald-700 font-medium">Server Online</span>
          </div>
        </header>

        {/* PAGE AREA */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}