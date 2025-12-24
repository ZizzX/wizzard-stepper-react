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
    ],
  },
  {
    title: "Advanced",
    items: [
      { id: "persistence", label: "Persistence", path: "/docs/persistence" },
      { id: "validation", label: "Validation", path: "/docs/validation" },
      { id: "conditional", label: "Conditional Flow", path: "/docs/conditional-logic" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { id: "react-hook-form", label: "React Hook Form", path: "/docs/rhf" },
      { id: "formik", label: "Formik", path: "/docs/formik" },
    ],
  },
];

export default function DocsLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="sticky top-24 space-y-8">
          {sidebarItems.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 px-2 uppercase tracking-wider">
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
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
      <main className="flex-1 min-w-0 max-w-4xl prose prose-indigo prose-slate">
        <Outlet />
      </main>
    </div>
  );
}
