import DocsNavigation from "../../components/DocsNavigation";

export default function Validation() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Validation Mastery
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          From simple synchronous checks to complex, asynchronous API-based 
          validation. Build bulletproof forms with zero sweat.
        </p>
      </section>

      {/* 1. Asynchronous Validation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Asynchronous Validation</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Need to check if a username is taken? Our adapters are 
          <strong> async-native</strong>. Returning a <code className="text-indigo-600">Promise</code> from 
          your adapter automatically puts the wizard into a loading state.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">UsernameAdapter</span> <span className="text-emerald-400">= {"{"}</span></div>
            <div className="pl-4"><span className="text-indigo-400">validate</span><span className="text-emerald-400">:</span> <span className="text-purple-400">async</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">data</span><span className="text-emerald-400">) =&gt; {"{"}</span></div>
            <div className="pl-8"><span className="text-purple-400">const</span> <span className="text-indigo-300">isTaken</span> <span className="text-emerald-400">=</span> <span className="text-purple-400">await</span> <span className="text-blue-400">api</span><span className="text-emerald-400">.</span><span className="text-indigo-300">checkUser</span><span className="text-emerald-400">(</span><span className="text-indigo-300">data</span><span className="text-emerald-400">.</span><span className="text-indigo-300">username</span><span className="text-emerald-400">);</span></div>
            <div className="pl-8"><span className="text-purple-400">return</span> <span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-12"><span className="text-indigo-400">isValid</span><span className="text-emerald-400">: !</span><span className="text-indigo-300">isTaken</span><span className="text-emerald-400">,</span></div>
            <div className="pl-12"><span className="text-indigo-400">errors</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">isTaken</span> <span className="text-emerald-400">? {"{"}</span> <span className="text-indigo-400">username</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'Username already in use'</span> <span className="text-emerald-400">{"}"}</span> <span className="text-emerald-400">:</span> <span className="text-emerald-400">undefined</span></div>
            <div className="pl-8 text-emerald-400">{" };"}</div>
            <div className="pl-4 text-emerald-400">{" }"}</div>
            <div className="text-emerald-400">{"};"}</div>
          </pre>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4">
          <div className="text-amber-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Pro Tip:</strong> Use <code className="text-amber-900 font-bold font-mono">isLoading</code> from 
            <code className="text-amber-900 font-bold font-mono">useWizard()</code> to disable your 
            "Next" button while async validation is in flight.
          </p>
        </div>
      </section>

      {/* 2. Custom Adapters */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Building Custom Adapters</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Don't use Zod or Yup? No problem. Simply implement the 
          <code className="text-indigo-600 font-mono">IValidatorAdapter</code> interface.
        </p>

        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 italic text-gray-500 font-medium text-center">
          "The library is headless. It doesn't care how you validate, only that you return a 
          ValidationResult."
        </div>
      </section>

      {/* 3. Debouncing Validation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Debouncing Heavy Schemes</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Running complex Zod schemas on every keystroke can slow down your UI. 
          Use the <code className="text-indigo-600 font-mono">debounceValidation</code> option 
          in <code className="text-indigo-600 font-mono">setData</code> to keep things responsive.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="text-gray-400">
            <span className="text-indigo-300">setData</span><span className="text-emerald-400">(</span><span className="text-amber-400">'bio'</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">value</span><span className="text-emerald-400">, {"{"}</span><br/>
            <span className="pl-4 text-gray-500">// Only run validation 500ms after user stops typing</span><br/>
            <span className="pl-4"><span className="text-indigo-400">debounceValidation</span><span className="text-emerald-400">:</span> <span className="text-orange-400">500</span></span><br/>
            <span className="text-emerald-400">{"}"});</span>
          </pre>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Persistence", href: "/docs/persistence" }}
        next={{ label: "Conditional Flow", href: "/docs/conditional-logic" }}
      />
    </div>
  );
}
