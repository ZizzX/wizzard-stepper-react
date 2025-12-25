import { useState } from 'react';
import { cn } from '../../lib/utils';
import DocsNavigation from '../../components/DocsNavigation';
import { ProTip } from "../../components/ProTip";

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
        
        <ProTip>
          If you plan to use specialized validation adapters, you might also need to install:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">zod</code> - for Zod validation</li>
            <li><code className="bg-blue-100 px-1 rounded">yup</code> - for Yup validation</li>
          </ul>
        </ProTip>
      </section>

      <DocsNavigation 
        next={{ label: "Quick Start", href: "/docs/quickstart" }} 
      />
    </div>
  );
}
