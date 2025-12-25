import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from './lib/utils';
import { Button } from './components/ui/Button';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/docs/introduction', label: 'Documentation' },
    { path: '/examples', label: 'Examples' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors">
                  W
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Wizard Stepper
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = item.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.includes(item.path.split('/')[2] || item.path.split('/')[1]);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-indigo-50 text-indigo-700 font-semibold" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
               <a 
                 href="https://github.com/ZizzX/wizzard-stepper-react" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <span className="sr-only">GitHub</span>
                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                   <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                 </svg>
               </a>
               <Button size="sm" variant="outline" onClick={() => window.open('https://www.npmjs.com/package/wizzard-stepper-react', '_blank')}>
                  v1.5.2
               </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-10 pb-10">
         <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
           <p className="text-gray-500 text-sm">
             Built with <span className="text-red-500">♥</span> using wizzard-stepper-react
           </p>
        </div>
      </footer>
    </div>
  );
}
