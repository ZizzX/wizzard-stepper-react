import DocsNavigation from "../../components/DocsNavigation";

export default function ValibotDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Valibot
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          The future of lightweight validation. Learn how to implement a 
          Valibot adapter to keep your wizard bundle size tiny.
        </p>
      </section>

      {/* 1. Custom Adapter Implementation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Valibot Adapter</h2>
        </div>
        <p className="text-gray-600">
          Valibot is a great choice for mobile-first wizards where every kilobyte 
          counts. Here's a professional implementation of a Valibot adapter:
        </p>

        <div className="bg-gray-900 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <div className="p-8 font-mono text-[13px] leading-relaxed">
            <div className="space-y-1 text-gray-400">
              <div><span className="text-purple-400">export class</span> <span className="text-indigo-300">ValibotAdapter</span> <span className="text-purple-400">implements</span> <span className="text-amber-400">IValidatorAdapter</span> <span className="text-emerald-400">{"{"}</span></div>
              <div className="pl-4"><span className="text-indigo-300">constructor</span><span className="text-emerald-400">(</span><span className="text-purple-400">private</span> <span className="text-indigo-300">schema</span><span className="text-emerald-400">:</span> <span className="text-amber-400">any</span><span className="text-emerald-400">)</span> <span className="text-emerald-400">{"{}"}</span></div>
              <div className="pt-2 pl-4"><span className="text-purple-400">async</span> <span className="text-indigo-300">validate</span><span className="text-emerald-400">(</span><span className="text-indigo-300">data</span><span className="text-emerald-400">:</span> <span className="text-amber-400">any</span><span className="text-emerald-400">)</span> <span className="text-emerald-400">{"{"}</span></div>
              <div className="pl-8"><span className="text-purple-400">const</span> <span className="text-indigo-300">result</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">safeParse</span><span className="text-emerald-400">(</span><span className="text-purple-400">this</span><span className="text-emerald-400">.</span><span className="text-indigo-300">schema</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">data</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
              <div className="pl-8"><span className="text-purple-400">return</span> <span className="text-emerald-400">{"{"}</span></div>
              <div className="pl-12"><span className="text-sky-300">isValid</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">result</span><span className="text-emerald-400">.</span><span className="text-indigo-300">success</span><span className="text-emerald-400">,</span></div>
              <div className="pl-12"><span className="text-sky-300">errors</span><span className="text-emerald-400">:</span> <span className="text-indigo-300">result</span><span className="text-emerald-400">.</span><span className="text-indigo-300">issues</span><span className="text-emerald-400">?.</span><span className="text-indigo-300">reduce</span><span className="text-emerald-400">(</span><span className="text-emerald-400">(</span><span className="text-indigo-300">acc</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">issue</span><span className="text-emerald-400">)</span> <span className="text-purple-400">=&gt;</span> <span className="text-emerald-400">{"{"}</span></div>
              <div className="pl-16"><span className="text-indigo-300">acc</span><span className="text-emerald-400">[</span><span className="text-indigo-300">issue</span><span className="text-emerald-400">.</span><span className="text-indigo-300">path</span><span className="text-emerald-400">[</span><span className="text-amber-300">0</span><span className="text-emerald-400">]</span><span className="text-emerald-400">.</span><span className="text-indigo-300">key</span><span className="text-emerald-400">]</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">issue</span><span className="text-emerald-400">.</span><span className="text-indigo-300">message</span><span className="text-emerald-400">;</span></div>
              <div className="pl-16"><span className="text-purple-400">return</span> <span className="text-indigo-300">acc</span><span className="text-emerald-400">;</span></div>
              <div className="pl-12"><span className="text-emerald-400">{"}, {})"}</span></div>
              <div className="pl-8"><span className="text-emerald-400">{"}"}</span></div>
              <div className="pl-4"><span className="text-emerald-400">{"}"}</span></div>
              <div><span className="text-emerald-400">{"}"}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bundle Comparison */}
      <section className="space-y-6">
         <h3 className="text-xl font-bold text-gray-900">Why Valibot?</h3>
         <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Library</th>
                        <th className="px-6 py-4">Bundle Size (KB)</th>
                        <th className="px-6 py-4">Tree Shakeable</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="px-6 py-4 font-bold text-indigo-600">Zod</td>
                        <td className="px-6 py-4 text-gray-600">~13kB</td>
                        <td className="px-6 py-4 text-rose-500 font-medium">Limited</td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 font-bold text-orange-600">Valibot</td>
                        <td className="px-6 py-4 text-gray-600">&lt; 1kB</td>
                        <td className="px-6 py-4 text-emerald-500 font-medium">Full Support</td>
                    </tr>
                </tbody>
            </table>
         </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "TanStack Form", href: "/docs/tanstack" }}
        next={{ label: "Examples", href: "/examples" }}
      />
    </div>
  );
}
