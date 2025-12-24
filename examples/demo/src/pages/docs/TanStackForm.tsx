import DocsNavigation from "../../components/DocsNavigation";

export default function TanStackDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          TanStack Form
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          The ultimate Type-Safe form management. Learn how to combine 
          TanStack's granular control with our wizard orchestration.
        </p>
      </section>

      {/* 1. Type Safety First */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">True Type Safety</h2>
        </div>
        <p className="text-gray-600 text-sm">
          TanStack Form allows you to define field-level logic that is completely 
          decoupled from the UI. This is perfect for complex wizards where logic 
          needs to be pure and testable.
        </p>

        <div className="bg-gray-950 rounded-3xl p-8 font-mono text-[12px] shadow-2xl ring-1 ring-white/10">
          <div className="space-y-2 text-gray-400 border-l-2 border-yellow-500/30 pl-6">
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">form</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">useForm</span><span className="text-emerald-400">(</span><span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-4"><span className="text-sky-300">defaultValues</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">useWizardValue</span><span className="text-emerald-400">&lt;</span><span className="text-amber-400">UserData</span><span className="text-emerald-400">&gt;</span><span className="text-emerald-400">(</span><span className="text-amber-300">'user'</span><span className="text-emerald-400">)</span><span className="text-emerald-400">,</span></div>
            <div className="pl-4"><span className="text-sky-300">onSubmit</span><span className="text-emerald-400">:</span> <span className="text-purple-400">async</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">values</span><span className="text-emerald-400">)</span> <span className="text-purple-400">=&gt;</span> <span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-8 text-gray-500 italic">// Atomic update to wizard store</div>
            <div className="pl-8"><span className="text-indigo-300">setData</span><span className="text-emerald-400">(</span><span className="text-amber-300">'user'</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">values</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
            <div className="pl-8"><span className="text-indigo-300">goToNextStep</span><span className="text-emerald-400">(</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
            <div className="pl-4"><span className="text-emerald-400">{"}"}</span></div>
            <div><span className="text-emerald-400">{"});"}</span></div>
          </div>
        </div>
      </section>

      {/* 2. Performance Note */}
      <section className="space-y-6 border-l-4 border-yellow-500 pl-8 py-2">
        <h3 className="text-lg font-bold text-gray-900">Granular Subscriptions</h3>
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          Because TanStack Form uses a subscription-based model, it pairs perfectly 
          with our <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">useWizardValue</code> hook. 
          The component will only re-render when the specific field path changes, 
          making it ideal for high-performance wizards with hundreds of inputs.
        </p>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Mantine Form", href: "/docs/mantine" }}
        next={{ label: "Valibot", href: "/docs/valibot" }}
      />
    </div>
  );
}
