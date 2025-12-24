import DocsNavigation from '../../components/DocsNavigation';

export default function TypeReference() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Type Reference
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Comprehensive API reference for all TypeScript interfaces and types used in <code className="text-indigo-600">wizzard-stepper-react</code>.
        </p>
      </div>

      {/* 1. IWizardContext */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">1</div>
          <h2 className="text-2xl font-bold text-gray-900">IWizardContext</h2>
        </div>
        <p className="text-gray-600 max-w-3xl">
          The internal state shape managed by the Wizard Provider. This is what you interact with via hooks.
        </p>
        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">interface</span> <span className="text-amber-400">IWizardContext</span><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">TData</span><span className="text-emerald-400">&gt; {"{"}</span></div>
            <div className="pl-4"><span className="text-indigo-400">wizardData</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">TData</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Global state of all steps</span></div>
            <div className="pl-4"><span className="text-indigo-400">activeSteps</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IStepConfig</span><span className="text-emerald-400">[];</span> <span className="text-gray-500">// Currently visible steps based on conditions</span></div>
            <div className="pl-4"><span className="text-indigo-400">currentStepIndex</span><span className="text-emerald-400">:</span> <span className="text-rose-400">number</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Actual index in activeSteps</span></div>
            <div className="pl-4"><span className="text-indigo-400">errors</span><span className="text-emerald-400">:</span> <span className="text-amber-400">Record</span><span className="text-emerald-400">&lt;</span><span className="text-rose-400">string</span><span className="text-emerald-400">,</span> <span className="text-rose-400">string</span><span className="text-emerald-400">&gt;;</span> <span className="text-gray-500">// Validation errors map</span></div>
            <div className="pl-4"><span className="text-indigo-400">isLoading</span><span className="text-emerald-400">:</span> <span className="text-rose-400">boolean</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// True during async validation or transitions</span></div>
            <div className="pl-4"><span className="text-indigo-400">visitedSteps</span><span className="text-emerald-400">:</span> <span className="text-amber-400">Set</span><span className="text-emerald-400">&lt;</span><span className="text-rose-400">string</span><span className="text-emerald-400">&gt;;</span> <span className="text-gray-500">// IDs of all steps the user has seen</span></div>
            <div className="pl-4"><span className="text-indigo-400">completedSteps</span><span className="text-emerald-400">:</span> <span className="text-amber-400">Set</span><span className="text-emerald-400">&lt;</span><span className="text-rose-400">string</span><span className="text-emerald-400">&gt;;</span> <span className="text-gray-500">// IDs of steps that passed validation</span></div>
            <div className="text-emerald-400">{"}"}</div>
          </pre>
        </div>
      </section>

      {/* 2. IStepConfig */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">2</div>
          <h2 className="text-2xl font-bold text-gray-900">IStepConfig</h2>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Individual step definition. Defines behaviors like visibility rules and validation logic.
        </p>
        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">interface</span> <span className="text-amber-400">IStepConfig</span><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">TStepData</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">TGlobalContext</span><span className="text-emerald-400">&gt; {"{"}</span></div>
            <div className="pl-4"><span className="text-indigo-400">id</span><span className="text-emerald-400">:</span> <span className="text-rose-400">string</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Must be unique within the wizard</span></div>
            <div className="pl-4"><span className="text-indigo-400">label</span><span className="text-emerald-400">:</span> <span className="text-rose-400">string</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Display name for breadcrumbs/indicators</span></div>
            <div className="pl-4"><span className="text-indigo-400">condition</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">ctx</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">TGlobalContext</span><span className="text-emerald-400">) =&gt;</span> <span className="text-rose-400">boolean</span><span className="text-emerald-400">;</span></div>
            <div className="pl-4"><span className="text-indigo-400">validationAdapter</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IValidatorAdapter</span><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">TStepData</span><span className="text-emerald-400">&gt;;</span></div>
            <div className="pl-4"><span className="text-indigo-400">autoValidate</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-rose-400">boolean</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// If true, validates on every change</span></div>
            <div className="pl-4"><span className="text-indigo-400">component</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-blue-400">React</span><span className="text-emerald-400">.</span><span className="text-amber-400">ComponentType</span><span className="text-emerald-400">&lt;</span><span className="text-rose-400">any</span><span className="text-emerald-400">&gt;;</span></div>
            <div className="text-emerald-400">{"}"}</div>
          </pre>
        </div>
      </section>

      {/* 3. IWizardConfig */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">3</div>
          <h2 className="text-2xl font-bold text-gray-900">IWizardConfig</h2>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Global configuration for the Wizard Provider.
        </p>
        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">interface</span> <span className="text-amber-400">IWizardConfig</span><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">TSchema</span><span className="text-emerald-400">&gt; {"{"}</span></div>
            <div className="pl-4"><span className="text-indigo-400">steps</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IStepConfig</span><span className="text-emerald-400">[];</span> <span className="text-gray-500">// Array of step definitions</span></div>
            <div className="pl-4"><span className="text-indigo-400">autoValidate</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-rose-400">boolean</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Global auto-validate flag</span></div>
            <div className="pl-4"><span className="text-indigo-400">persistence</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-8"><span className="text-indigo-400">mode</span><span className="text-emerald-400">:</span> <span className="text-amber-400">PersistenceMode</span><span className="text-emerald-400">;</span></div>
            <div className="pl-8"><span className="text-indigo-400">adapter</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IPersistenceAdapter</span><span className="text-emerald-400">;</span></div>
            <div className="pl-4 text-emerald-400">{" }"}</div>
            <div className="pl-4">
              <span className="text-indigo-400">onStepChange</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">(</span>
              <span className="text-indigo-300">from</span><span className="text-emerald-400">,</span> 
              <span className="text-indigo-300">to</span><span className="text-emerald-400">,</span> 
              <span className="text-indigo-300">data</span>
              <span className="text-emerald-400">) =&gt;</span> <span className="text-rose-400">void</span><span className="text-emerald-400">;</span>
            </div>
            <div className="text-emerald-400">{"}"}</div>
          </pre>
        </div>
      </section>

      {/* 4. Adapters & Results */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">4</div>
          <h2 className="text-2xl font-bold text-gray-900">Adapters & Results</h2>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* IValidatorAdapter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              IValidatorAdapter
            </h3>
            <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
              <pre className="space-y-4 text-gray-400">
                <div><span className="text-purple-400">interface</span> <span className="text-amber-400">IValidatorAdapter</span><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">TData</span><span className="text-emerald-400">&gt; {"{"}</span></div>
                <div className="pl-4">
                  <span className="text-indigo-400">validate</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">data</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">TData</span><span className="text-emerald-400">) =&gt;</span> 
                  <span className="text-amber-400"> ValidationResult</span> <span className="text-purple-400">|</span> <span className="text-purple-400">Promise</span><span className="text-emerald-400">&lt;</span><span className="text-amber-400">ValidationResult</span><span className="text-emerald-400">&gt;;</span>
                </div>
                <div className="text-emerald-400">{"}"}</div>
              </pre>
            </div>
          </div>

          {/* ValidationResult */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              ValidationResult
            </h3>
            <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
              <pre className="space-y-2 text-gray-400">
                <div><span className="text-purple-400">type</span> <span className="text-rose-400">ValidationResult</span> <span className="text-emerald-400">=</span> <span className="text-emerald-400">{"{"}</span></div>
                <div className="pl-4"><span className="text-indigo-400">isValid</span><span className="text-emerald-400">:</span> <span className="text-rose-400">boolean</span><span className="text-emerald-400">;</span> <span className="text-gray-500">// Critical flag for movement</span></div>
                <div className="pl-4"><span className="text-indigo-400">errors</span><span className="text-emerald-400">?</span><span className="text-emerald-400">:</span> <span className="text-amber-400">Record</span><span className="text-emerald-400">&lt;</span><span className="text-rose-400">string</span><span className="text-emerald-400">,</span> <span className="text-rose-400">string</span><span className="text-emerald-400">&gt;;</span> <span className="text-gray-500">// Flattened error map</span></div>
                <div className="text-emerald-400">{"}"}</div>
              </pre>
            </div>
          </div>

          {/* IPersistenceAdapter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              IPersistenceAdapter
            </h3>
            <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
              <pre className="space-y-4 text-gray-400">
                <div><span className="text-purple-400">interface</span> <span className="text-amber-400">IPersistenceAdapter</span> <span className="text-emerald-400">{"{"}</span></div>
                <div className="pl-4">
                  <span className="text-indigo-400">saveStep</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">&lt;</span><span className="text-indigo-300">T</span><span className="text-emerald-400">&gt;(</span><span className="text-indigo-300">stepId</span><span className="text-emerald-400">:</span> <span className="text-rose-400">string</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">data</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">T</span><span className="text-emerald-400">) =&gt;</span> <span className="text-rose-400">void</span><span className="text-emerald-400">;</span>
                </div>
                <div className="pl-4">
                  <span className="text-indigo-400">getStep</span><span className="text-emerald-400">:</span> <span className="text-emerald-400">&lt;</span><span className="text-indigo-300">T</span><span className="text-emerald-400">&gt;(</span><span className="text-indigo-300">stepId</span><span className="text-emerald-400">:</span> <span className="text-rose-400">string</span><span className="text-emerald-400">) =&gt;</span> <span className="text-indigo-300">T</span> <span className="text-emerald-400">|</span> <span className="text-rose-400">undefined</span><span className="text-emerald-400">;</span>
                </div>
                <div className="pl-4"><span className="text-indigo-400">clear</span><span className="text-emerald-400">: () =&gt;</span> <span className="text-rose-400">void</span><span className="text-emerald-400">;</span></div>
                <div className="text-emerald-400">{"}"}</div>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Enumerations & Constants */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold">5</div>
          <h2 className="text-2xl font-bold text-gray-900">Enumerations</h2>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">PersistenceMode</th>
                <th className="px-6 py-4">Trigger Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { v: "onStepChange", d: "Recommended. Saves only when the user moves forward or back." },
                { v: "onChange", d: "Real-time. Saves on every field update (debounced)." },
                { v: "manual", d: "Explicit. You decide when to trigger save via actions." }
              ].map(row => (
                <tr key={row.v}>
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{row.v}</td>
                  <td className="px-6 py-4 text-gray-600 leading-relaxed">{row.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Hooks API", href: "/docs/hooks" }}
      />
    </div>
  );
}
