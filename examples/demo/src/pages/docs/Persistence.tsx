import DocsNavigation from "../../components/DocsNavigation";

export default function Persistence() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Persistence Strategies
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Learn how to survive page reloads and manage sensitive data using our 
          flexible adapter architecture.
        </p>
      </section>

      {/* 1. Persistence Modes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Persistence Modes</h2>
        </div>
        <p className="text-gray-600">
          The <code className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">PersistenceMode</code> 
          determines when your data is committed to the storage adapter.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">Manual</h3>
            <p className="text-sm text-gray-500 italic">"Full Control"</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Data is only saved when you explicitly call the <code className="text-indigo-500">save()</code> action.
            </p>
          </div>
          <div className="p-6 bg-indigo-600 rounded-2xl text-white space-y-3 shadow-xl shadow-indigo-100">
            <h3 className="font-bold">onStepChange</h3>
            <p className="text-indigo-200 text-sm italic">"The Sweet Spot"</p>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Saves progress whenever a user successfully navigates to a new step. Minimum overhead.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900">onChange</h3>
            <p className="text-sm text-gray-500 italic">"Google Docs Style"</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Commits data on every keystroke. Best used with our built-in debouncing.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Hybrid Storage Strategy */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Hybrid Storage (Security)</h2>
        </div>
        <p className="text-gray-600">
          For production apps, you often want to persist general info (Name) but keep 
          sensitive info (Credit Card) strictly in memory.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">config</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IWizardConfig</span> <span className="text-emerald-400">= {"{"}</span></div>
            <div className="pl-4 text-gray-500">// Global: Persist everything to LocalStorage</div>
            <div className="pl-4"><span className="text-indigo-400">persistence</span><span className="text-emerald-400">: {"{"}</span></div>
            <div className="pl-8"><span className="text-indigo-400">mode</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'onStepChange'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-8"><span className="text-indigo-400">adapter</span><span className="text-emerald-400">:</span> <span className="text-purple-400">new</span> <span className="text-blue-400">LocalStorageAdapter</span><span className="text-emerald-400">(</span><span className="text-amber-400">'app_wizard'</span><span className="text-emerald-400">)</span></div>
            <div className="pl-4 text-emerald-400">{" },"}</div>
            <div className="pl-4"><span className="text-indigo-400">steps</span><span className="text-emerald-400">: [</span></div>
            <div className="pl-8 text-emerald-400">{"{"}</div>
            <div className="pl-12"><span className="text-indigo-400">id</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'billing'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-12 text-gray-500">// Override for this step only!</div>
            <div className="pl-12"><span className="text-indigo-400">persistenceAdapter</span><span className="text-emerald-400">:</span> <span className="text-purple-400">new</span> <span className="text-blue-400">MemoryAdapter</span><span className="text-emerald-400">()</span></div>
            <div className="pl-8 text-emerald-400">{" },"}</div>
            <div className="pl-4 text-emerald-400">]</div>
            <div className="text-emerald-400">{"}"}</div>
          </pre>
        </div>
      </section>

      {/* 3. Debouncing Saves */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Programmatic Control</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800">Clear & Reset</h4>
            <p className="text-sm text-gray-600">
              When a user submits the form, you should clear the persistent state to 
              prevent old data from showing up on the next start.
            </p>
            <div className="bg-gray-950 rounded-xl p-6 font-mono text-[10px] shadow-lg">
              <pre className="text-gray-400">
                <span className="text-purple-400">const</span> <span className="text-emerald-400">{"{"}</span> <span className="text-indigo-300">resetWizard</span> <span className="text-emerald-400">{"}"}</span> <span className="text-emerald-400">=</span> <span className="text-blue-400">useWizard</span><span className="text-emerald-400">();</span><br/><br/>
                <span className="text-purple-300">// Clears both context state and storage</span><br/>
                <span className="text-indigo-300">resetWizard</span><span className="text-emerald-400">();</span>
              </pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800">Debounced Inputs</h4>
            <p className="text-sm text-gray-600">
              When using <code className="text-indigo-500">onChange</code> mode, use the 
              <code className="text-indigo-500">debounceValidation</code> option to 
              prevent hitting your storage adapter too hard on every keystroke.
            </p>
            <div className="bg-gray-950 rounded-xl p-6 font-mono text-[10px] shadow-lg">
              <pre className="text-gray-400">
                <span className="text-indigo-300">setData</span><span className="text-emerald-400">(</span><span className="text-amber-400">'description'</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">value</span><span className="text-emerald-400">, {"{"}</span><br/>
                <span className="pl-4"><span className="text-indigo-400">debounceValidation</span><span className="text-emerald-400">:</span> <span className="text-orange-400">300</span></span><br/>
                <span className="text-emerald-400">{"}"});</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Type Reference", href: "/docs/types" }}
        next={{ label: "Validation", href: "/docs/validation" }}
      />
    </div>
  );
}
