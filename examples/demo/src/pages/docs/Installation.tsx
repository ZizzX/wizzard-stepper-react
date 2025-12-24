import { useState } from 'react';
import { cn } from '../../lib/utils';
import DocsNavigation from '../../components/DocsNavigation';

export default function Installation() {
  const [activeManager, setActiveManager] = useState(0);
  
  const installCommands = [
    { label: "npm", command: "npm install wizzard-stepper-react" },
    { label: "pnpm", command: "pnpm add wizzard-stepper-react" },
    { label: "yarn", command: "yarn add wizzard-stepper-react" },
    { label: "bun", command: "bun add wizzard-stepper-react" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Installation
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Install the package using your favorite package manager.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-xl border border-gray-800">
          <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
             <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
             </div>
          </div>
          <div className="p-6">
            <pre className="text-indigo-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
              {installCommands[activeManager].command}
            </pre>
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          {installCommands.map((item, index) => (
            <button 
              key={item.label} 
              onClick={() => setActiveManager(index)}
              className={cn(
                "text-xs font-medium px-4 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
                activeManager === index 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-6 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Peer Dependencies</h2>
        <p className="text-gray-600">
          The library requires <code className="text-indigo-600">react</code> (16.8.0 or later) as a peer dependency.
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Optional Dependencies
          </div>
          <p className="text-amber-700 text-sm leading-relaxed">
            If you plan to use specialized validation adapters, you might also need to install:
          </p>
          <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
            <li><code className="bg-amber-100/50 px-1 rounded">zod</code> - for Zod validation</li>
            <li><code className="bg-amber-100/50 px-1 rounded">yup</code> - for Yup validation</li>
          </ul>
        </div>
      </section>

      <DocsNavigation 
        next={{ label: "Quick Start", href: "/docs/quickstart" }} 
      />
    </div>
  );
}
