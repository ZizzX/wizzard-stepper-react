import DocsNavigation from "../../components/DocsNavigation";

export default function RoutingDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Routing & URL Sync
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Learn how to connect your wizard to the browser's URL, enabling 
          deep linking, "Back" button support, and SEO-friendly flows.
        </p>
      </section>

      {/* 1. URL Synchronization */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Syncing with URL</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          To keep the URL in sync with the current step, use the 
          <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">onStepChange</code> 
          callback provided by <code className="text-indigo-600">IWizardConfig</code>.
        </p>

        <div className="bg-gray-950 rounded-2xl p-8 font-mono text-xs overflow-x-auto shadow-2xl ring-1 ring-white/10">
          <pre className="space-y-2 text-gray-400">
            <div><span className="text-purple-300">// Example with react-router-dom</span></div>
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">navigate</span> <span className="text-emerald-400">=</span> <span className="text-blue-400">useNavigate</span><span className="text-emerald-400">();</span></div>
            <br/>
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">config</span><span className="text-emerald-400">:</span> <span className="text-amber-400">IWizardConfig</span> <span className="text-emerald-400">= {"{"}</span></div>
            <div className="pl-4"><span className="text-indigo-400">onStepChange</span><span className="text-emerald-400">: (</span><span className="text-indigo-300">prev</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">next</span><span className="text-emerald-400">) =&gt; {"{"}</span></div>
            <div className="pl-8"><span className="text-indigo-300">navigate</span><span className="text-emerald-400">(</span><span className="text-amber-400">{"`"}/wizard/</span><span className="text-emerald-400">{"${"}</span><span className="text-indigo-300">next</span><span className="text-emerald-400">{"}"}</span><span className="text-amber-400">{"`"}</span><span className="text-emerald-400">);</span></div>
            <div className="pl-4 text-emerald-400">{" },"}</div>
            <div className="pl-4"><span className="text-indigo-400">steps</span><span className="text-emerald-400">: [ ... ]</span></div>
            <div className="text-emerald-400">{"};"}</div>
          </pre>
        </div>
      </section>

      {/* 2. Best Practices for URL State */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Why store state in URL?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900">Deep Linking</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Users can share links to specific steps. When the page reloads, 
              initialize the wizard with <code className="text-indigo-500">initialStepId</code> 
              from your URL params.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900">Native Back Support</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              When steps are mapped to URL paths, the browser's "Back" button 
              just works! The wizard will naturally follow the URL changes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Next.js (App Router) Integration */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-sm">N</div>
          <h2 className="text-2xl font-bold text-gray-900">Next.js App Router</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          In Next.js, use a <strong>Client Boundary</strong> for the wizard logic, 
          but you can still keep initialization data in your <strong>Server Components</strong>.
        </p>

        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 space-y-4 shadow-inner">
          <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">The "Client-Side Wrapper" Pattern</h4>
          <div className="bg-white p-4 rounded-xl font-mono text-[10px] text-gray-600 border border-gray-200">
            <span className="text-purple-600 font-bold">'use client';</span><br/><br/>
            <span className="text-gray-400">// Wrap your wizard in a client component</span><br/>
            <span className="text-purple-600">export default function</span> <span className="text-blue-600 font-bold">WizardPortal</span><span className="text-gray-900">({"{"} initialData {"}"}) {"{"}</span><br/>
            <span className="pl-4"><span className="text-purple-600">return</span> (</span><br/>
            <span className="pl-8"><span className="text-indigo-600">&lt;WizardProvider</span> initialData<span className="text-gray-900">={"{"}initialData{"}"}</span> <span className="text-indigo-600">/&gt;</span></span><br/>
            <span className="pl-4">);</span><br/>
            <span className="text-gray-900">{"}"}</span>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Conditional Flow", href: "/docs/conditional-logic" }}
        next={{ label: "Step Rendering", href: "/docs/rendering" }}
      />
    </div>
  );
}
