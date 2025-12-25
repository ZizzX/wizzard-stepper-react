import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from './lib/utils';

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction", path: "/docs/introduction" },
      { id: "installation", label: "Installation", path: "/docs/installation" },
      { id: "quickstart", label: "Quick Start", path: "/docs/quickstart" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { id: "concepts", label: "Overview & Factory", path: "/docs/concepts" },
      { id: "hooks", label: "Hooks API", path: "/docs/hooks" },
      { id: "types", label: "Type Reference", path: "/docs/types" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { id: "persistence", label: "Persistence", path: "/docs/persistence" },
      { id: "validation", label: "Validation", path: "/docs/validation" },
      { id: "conditional", label: "Conditional Flow", path: "/docs/conditional-logic" },
      { id: "routing", label: "Routing & URL", path: "/docs/routing" },
      { id: "rendering", label: "Step Rendering", path: "/docs/rendering" },
      { id: "performance", label: "Performance", path: "/docs/performance" },
      { id: "security", label: "Security & Integrity", path: "/docs/security" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { id: "rhf", label: "React Hook Form", path: "/docs/rhf" },
      { id: "formik", label: "Formik", path: "/docs/formik" },
      { id: "mantine", label: "Mantine Form", path: "/docs/mantine" },
      { id: "tanstack", label: "TanStack Form", path: "/docs/tanstack" },
      { id: "valibot", label: "Valibot", path: "/docs/valibot" },
    ],
  },
];

export default function DocsLayout() {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Find current item for mobile title
  const currentItem = sidebarItems.flatMap(g => g.items).find(i => i.path === location.pathname);

  return (
    <div className="flex flex-col md:flex-row gap-10 relative">
      {/* Mobile Sub-Navigation Bar - Sticks below main header */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between -mx-4 shadow-sm">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-2 py-1.5 -ml-1 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
                aria-label="Open documentation menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Docs Menu</span>
            </button>
        </div>
        
        <div className="flex items-center gap-1 text-[12px] font-medium text-gray-400">
            <span className="truncate max-w-[120px]">{currentItem?.label}</span>
        </div>
      </div>

      {/* Sidebar & Mobile Drawer */}
      <aside className={cn(
        "fixed inset-0 z-50 transition-all duration-300 md:relative md:z-0 md:block md:w-64 shrink-0",
        isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100 md:block ",
        !isSidebarOpen && "pointer-events-none md:pointer-events-auto"
      )}>
        {/* Mobile Overlay */}
        <div 
            className={cn(
                "absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] md:hidden transition-opacity duration-300",
                isSidebarOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Content */}
        <nav className="relative h-full w-4/5 max-w-[280px] bg-white border-r border-gray-100 overflow-y-auto px-6 py-8 shadow-2xl md:shadow-none md:p-0 md:w-full md:bg-transparent md:border-none md:sticky md:top-24 space-y-8 no-scrollbar">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between md:hidden mb-8 border-b border-gray-50 pb-4">
            <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">Navigation</span>
            <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-rose-500 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          {sidebarItems.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-[0.2em]">
                {group.title}
              </h4>
              <div className="flex flex-col space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
                        isActive
                           ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-indigo-200 translate-x-1"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:translate-x-1"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 max-w-4xl pt-6 md:pt-0">
        <article className="prose prose-indigo prose-slate max-w-none">
            <Outlet />
        </article>
      </main>
    </div>
  );
}
