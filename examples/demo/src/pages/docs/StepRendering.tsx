import DocsNavigation from "../../components/DocsNavigation";

export default function StepRendering() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Step Rendering
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Clean up your component code by moving from manual <code className="text-indigo-600 font-bold">switch</code> 
          statements to a declarative step renderer.
        </p>
      </section>

      {/* 1. Declarative UI */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Declarative Rendering</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Instead of manually checking <code className="text-indigo-600 font-bold">currentStep.id</code>, 
          let the <code className="text-indigo-600 font-extrabold">WizardStepRenderer</code> handle the UI 
          orchestration for you.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">steps</span> <span className="text-emerald-400">= [</span></div>
            <div className="pl-4 text-emerald-400">{"{"}</div>
            <div className="pl-8"><span className="text-indigo-400">id</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'start'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-8"><span className="text-indigo-400">component</span><span className="text-emerald-400">:</span> <span className="text-blue-400">StartComponent</span></div>
            <div className="pl-4 text-emerald-400">{"},"}</div>
            <div className="pl-4 text-emerald-400">{"{"}</div>
            <div className="pl-8"><span className="text-indigo-400">id</span><span className="text-emerald-400">:</span> <span className="text-amber-400">'end'</span><span className="text-emerald-400">,</span></div>
            <div className="pl-8"><span className="text-indigo-400">component</span><span className="text-emerald-400">:</span> <span className="text-blue-400">EndComponent</span></div>
            <div className="pl-4 text-emerald-400">{"},"}</div>
            <div className="text-emerald-400">];</div>
            <br/>
            <div><span className="text-gray-500">// In your App</span></div>
            <div><span className="text-emerald-400">&lt;</span><span className="text-blue-400">WizardProvider</span> <span className="text-indigo-400">config</span><span className="text-emerald-400">={"{"}</span><span className="text-indigo-300">{"{"}</span> <span className="text-indigo-300">steps</span> <span className="text-indigo-300">{"}"}</span><span className="text-emerald-400">{"}"}&gt;</span></div>
            <div className="pl-4"><span className="text-emerald-400">&lt;</span><span className="text-blue-400">WizardStepRenderer</span> <span className="text-emerald-400">/&gt;</span></div>
            <div><span className="text-emerald-400">&lt;/</span><span className="text-blue-400">WizardProvider</span><span className="text-emerald-400">&gt;</span></div>
          </pre>
        </div>
      </section>

      {/* 2. Shared Layout & Animations */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">The Power of <code>wrapper</code></h2>
        </div>
        <p className="text-gray-600 text-sm">
          The <code className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">wrapper</code> prop 
          allows you to wrap every step in a shared layout or animation container.
        </p>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-4 shadow-xl shadow-indigo-100">
          <h4 className="font-bold flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Animated Transitions
          </h4>
          <div className="bg-indigo-700/50 rounded-xl p-6 font-mono text-[10px] text-indigo-100">
            <span className="text-indigo-300">&lt;WizardStepRenderer</span><br/>
            <span className="pl-4">wrapper<span className="text-emerald-400">={"{"}</span><span className="text-emerald-400">({ "{" } children { "}" })</span> <span className="text-emerald-400">=&gt;</span> (</span><br/>
            <span className="pl-8 text-indigo-300">&lt;motion.div</span><br/>
            <span className="pl-12">initial<span className="text-emerald-400">={"{{ opacity: 0, x: 20 }}"}</span></span><br/>
            <span className="pl-12">animate<span className="text-emerald-400">={"{{ opacity: 1, x: 0 }}"}</span></span><br/>
            <span className="pl-12">exit<span className="text-emerald-400">={"{{ opacity: 0, x: -20 }}"}</span></span><br/>
            <span className="pl-8 text-indigo-300">&gt;</span><br/>
            <span className="pl-12 text-white">{"{ children }"}</span><br/>
            <span className="pl-8 text-indigo-300">&lt;/motion.div&gt;</span><br/>
            <span className="pl-4 text-emerald-400">{" )}"}</span><br/>
            <span className="text-indigo-300">/&gt;</span>
          </div>
        </div>
      </section>

      {/* 3. Global Context Access */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Layouts</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          The <code className="text-indigo-600 font-mono">WizardStepRenderer</code> 
          only renders the *active* component. You should still keep your global 
          controls (Back/Next buttons) outside of it to prevent them from 
          re-mounting on every step.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-gray-100 p-8 rounded-2xl bg-gray-50/30">
          <div className="space-y-2">
            <h5 className="font-bold text-gray-800 text-sm">✅ Recommended</h5>
            <div className="text-[10px] font-mono p-4 bg-white border border-gray-200 rounded-xl space-y-1">
              <div>&lt;WizardProvider&gt;</div>
              <div className="pl-4 text-emerald-600">&lt;WizardStepRenderer /&gt;</div>
              <div className="pl-4 text-indigo-600">&lt;WizardControls /&gt;</div>
              <div>&lt;/WizardProvider&gt;</div>
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-gray-800 text-sm italic opacity-60">❌ Not Recommended</h5>
            <div className="text-[10px] font-mono p-4 bg-white border border-gray-200 rounded-xl space-y-1 opacity-50">
              <div>&lt;WizardProvider&gt;</div>
              <div className="pl-4 text-emerald-600">&lt;WizardStepRenderer </div>
              <div className="pl-8">wrapper={"{ children => ("}</div>
              <div className="pl-12">{"<>"}</div>
              <div className="pl-16">{"{children}"}</div>
              <div className="pl-16">{"<WizardControls />"}</div>
              <div className="pl-12">{"</>"}</div>
              <div className="pl-8">{")}"}</div>
              <div className="pl-4">/&gt;</div>
              <div>&lt;/WizardProvider&gt;</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Routing & URL", href: "/docs/routing" }}
      />
    </div>
  );
}
