import DocsNavigation from "../../components/DocsNavigation";
import { ProTip } from "../../components/ProTip";

export default function ConditionalLogic() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Conditional Logic
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Build dynamic user journeys that adapt to their answers in real-time. 
          Static forms are boring; adaptive pipelines are the future.
        </p>
      </section>

      {/* 1. The Condition Pattern */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">The <code>condition</code> Property</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Every step can have an optional <code className="text-indigo-600 font-bold">condition</code> predicate. 
          If it returns <code className="text-rose-600">false</code>, the step is automatically 
          removed from the navigation queue.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">steps</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IStepConfig</span><span className="text-emerald-400">[] = [</span></div>
            <div className="pl-4 text-emerald-400">{"{"}</div>
            <div className="pl-8"><span className="text-indigo-400">id</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'insurance'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-8"><span className="text-indigo-400">label</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'Insurance Details'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-8 text-gray-500">// Only show if user is over 18 and owns a car</div>
            <div className="pl-8"><span className="text-indigo-400">condition</span><span className="text-emerald-400">: (</span><span className="text-indigo-300">data</span><span className="text-emerald-400">) =&gt;</span> <span className="text-indigo-300">data</span><span className="text-emerald-400">.</span><span className="text-indigo-300">age</span> <span className="text-emerald-400">&gt;=</span> <span className="text-orange-400">18</span> <span className="text-emerald-400">&amp;&amp;</span> <span className="text-indigo-300">data</span><span className="text-emerald-400">.</span><span className="text-indigo-300">hasCar</span><span className="text-emerald-400">,</span></div>
            <div className="pl-4 text-emerald-400">{"},"}</div>
            <div className="text-emerald-400">];</div>
          </pre>
        </div>
      </section>

      {/* 2. Visualizing the Pipeline */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Pipelines</h2>
        </div>
        <p className="text-gray-600 text-sm">
          The wizard re-evaluates all conditions whenever the state changes. This means 
          your <code className="text-indigo-600">activeSteps</code> array is always 
          synchronized with the global state.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-indigo-700">Reactive Progression</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              If a user changes an answer on Step 1 that makes Step 5 hidden, 
              the "Total Progress" percentage and "Step Count" will instantly 
              update to reflect the new reality.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-indigo-700">Deep Dependencies</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conditions can depend on nested data. Using <code className="text-indigo-500">getData('nested.field')</code> 
              within a condition is a best practice for complex state trees.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Async Conditions & Permissions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Async & Permission Guards</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          The <code className="text-indigo-600 font-mono">condition</code> property is intentionally <strong>synchronous</strong> 
          to ensure buttery-smooth UI transitions. To handle server-side permissions or async data:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
             <div className="flex items-center gap-2 font-bold text-gray-800">
               <span className="text-amber-600">A</span>
               <span>External Data Seeding</span>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
                Fetch permissions <strong>before</strong> initializing the wizard and pass them as 
                <code className="text-indigo-600">initialData</code>. This is the cleanest approach.
             </p>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-2 font-bold text-gray-800">
               <span className="text-amber-600">B</span>
               <span>The "Gatekeeping" Step</span>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
                Create a "Loading" step that fetches data in <code className="text-indigo-600">useEffect</code>. 
                Once data arrives, use <code className="text-indigo-600">setData('role', role)</code> 
                and move forward.
             </p>
          </div>
        </div>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div className="text-gray-500">// Example: Fetching roles in a step</div>
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">AuthGate</span> <span className="text-emerald-400">= () =&gt; {"{"}</span></div>
            <div className="pl-4"><span className="text-purple-400">const</span> <span className="text-emerald-400">{"{ "}</span><span className="text-indigo-300">setData</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">goToNextStep</span><span className="text-emerald-400"> {"}"}</span> <span className="text-emerald-400">=</span> <span className="text-blue-400">useWizardActions</span><span className="text-emerald-400">();</span></div>
            <div className="pl-4"><span className="text-blue-400">useEffect</span><span className="text-emerald-400">(() =&gt; {"{"}</span></div>
            <div className="pl-8"><span className="text-indigo-300">api</span>.<span className="text-blue-400">getProfile</span><span className="text-emerald-400">().</span><span className="text-blue-400">then</span><span className="text-emerald-400">(</span><span className="text-indigo-300">p</span> <span className="text-emerald-400">=&gt; {"{"}</span></div>
            <div className="pl-12"><span className="text-blue-400">setData</span><span className="text-emerald-400">(</span><span className="text-amber-400">'user'</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">p</span><span className="text-emerald-400">);</span></div>
            <div className="pl-12"><span className="text-blue-400">goToNextStep</span><span className="text-emerald-400">();</span> <span className="text-gray-500">// Auto-advance when ready</span></div>
            <div className="pl-8"><span className="text-emerald-400">{"}"});</span></div>
            <div className="pl-4"><span className="text-emerald-400">{"}"}, []);</span></div>
            <div className="pl-4"><span className="text-purple-400">return</span> <span className="text-emerald-400">&lt;</span><span className="text-amber-400">Spinner</span> <span className="text-emerald-400">/&gt;;</span></div>
            <div className="text-emerald-400">{"}"}</div>
          </pre>
        </div>
      </section>

      <ProTip>
        Don't put complex business logic inside step conditions. If a condition 
        requires more than 3 lines of code, extract it to a standalone utility 
        function for better testability.
      </ProTip>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Validation", href: "/docs/validation" }}
        next={{ label: "Routing & URL", href: "/docs/routing" }}
      />
    </div>
  );
}
