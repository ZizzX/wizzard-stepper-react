import DocsNavigation from "../../components/DocsNavigation";
import { ProTip } from "../../components/ProTip";

export default function SecurityDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-mono tracking-tighter">
          Security & Integrity
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Learn how to protect your wizard flows from manual state manipulation, 
          unauthorized step-jumping, and sensitive data leaks.
        </p>
      </section>

      {/* 1. Navigation Guarding */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Step Access Control</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          In production apps, users might try to "skip ahead" by modifying the URL 
          or LocalStorage. To prevent this, implement a <strong>Navigation Guard</strong> using 
          the <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">onStepChange</code> interceptor.
        </p>

        <div className="bg-gray-950 rounded-3xl p-8 font-mono text-[13px] shadow-2xl ring-1 ring-white/10">
          <div className="space-y-2 text-gray-400">
            <div><span className="text-gray-400 italic">// Proposed "Expert" Pattern: Sequential Guard</span></div>
            <div><span className="text-purple-400">const</span> <span className="text-indigo-300">onStepChange</span> <span className="text-emerald-400">=</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">from</span><span className="text-emerald-400">:</span> <span className="text-amber-400">string</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">to</span><span className="text-emerald-400">:</span> <span className="text-amber-400">string</span><span className="text-emerald-400">)</span> <span className="text-purple-400">=&gt;</span> <span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-4"><span className="text-purple-400">const</span> <span className="text-indigo-300">isMovingForward</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">isAfter</span><span className="text-emerald-400">(</span><span className="text-indigo-300">to</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">from</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
            <div className="pl-4"><span className="text-purple-400">const</span> <span className="text-indigo-300">isTargetCompleted</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">completedSteps</span><span className="text-emerald-400">.</span><span className="text-indigo-300">has</span><span className="text-emerald-400">(</span><span className="text-indigo-300">to</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
            <div className="pt-2 pl-4 text-gray-500 italic">// Block forward navigation to unvisited/incomplete steps</div>
            <div className="pl-4"><span className="text-purple-400">if</span> <span className="text-emerald-400">(</span><span className="text-indigo-300">isMovingForward</span> <span className="text-purple-400">&&</span> <span className="text-purple-400">!</span><span className="text-indigo-300">isTargetCompleted</span><span className="text-emerald-400">)</span> <span className="text-emerald-400">{"{"}</span></div>
            <div className="pl-8"><span className="text-purple-400">throw new</span> <span className="text-indigo-300">Error</span><span className="text-emerald-400">(</span><span className="text-amber-300">"Must complete current step first."</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
            <div className="pl-4"><span className="text-emerald-400">{"}"}</span></div>
            <div><span className="text-emerald-400">{"}"}</span></div>
          </div>
        </div>
        
        <ProTip>
          We are currently considering adding a <code className="font-bold text-blue-900">navigationPolicy</code> prop 
          to the config: <code className="bg-blue-100 px-1 rounded italic text-xs">'strict' | 'loose' | 'sequential'</code>. 
          This would internalize the guard logic and make it declarative.
        </ProTip>
      </section>

      {/* 2. Data Integrity (Encryption) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Persistence Integrity</h2>
        </div>
        <p className="text-gray-600">
           Sensitive data in LocalStorage is vulnerable. A pro-grade solution 
           is to use an <strong>Encrypted Adapter</strong> with a session-based salt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-gray-100 p-8 rounded-2xl bg-gray-50/30">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800">Manual Manipulation Risk</h4>
            <p className="text-sm text-gray-500 leading-relaxed italic">
              "What if a user changes their credit score in LocalStorage manually?"
            </p>
            <div className="text-[10px] space-y-2 opacity-60">
                <div className="flex items-center gap-2 text-rose-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    <span>Plain LocalStorage data can be edited via DevTools.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Use a Hashed Signature (HMAC) to verify data integrity upon hydration.</span>
                </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-emerald-700">Expert: EncryptedLocalStorage</h4>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-emerald-100 shadow-xl ring-1 ring-white/10">
              <span className="text-purple-400">class</span> <span className="text-indigo-300">SecureAdapter</span> <span className="text-emerald-400">{"{"}</span><br/>
              &nbsp;&nbsp;<span className="text-indigo-300">saveStep</span><span className="text-emerald-400">(</span><span className="text-indigo-300">id</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">data</span><span className="text-emerald-400">)</span> <span className="text-emerald-400">{"{"}</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> <span className="text-indigo-300">encrypted</span> <span className="text-emerald-400">=</span> <span className="text-indigo-300">AES</span><span className="text-emerald-400">.</span><span className="text-indigo-300">encrypt</span><span className="text-emerald-400">(</span><span className="text-indigo-300">data</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">key</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-300">localStorage</span><span className="text-emerald-400">.</span><span className="text-indigo-300">setItem</span><span className="text-emerald-400">(</span><span className="text-indigo-300">id</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">encrypted</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span><br/>
              &nbsp;&nbsp;<span className="text-emerald-400">{"}"}</span><br/>
              <span className="text-emerald-400">{"}"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. URL Safety */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Deep Link Sanitization</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
           When using <code className="text-amber-600 font-bold">initialStepId</code> from the URL, always 
           cross-reference it against your known config. The library does this 
           automatically, but you should also verify that the user has the 
           rights to view that step.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-gray-100 p-8 rounded-2xl bg-gray-50/30">
            <div className="space-y-2">
                <h5 className="font-bold text-gray-800 text-sm">❌ Vulnerable</h5>
                <div className="text-[10px] font-mono p-4 bg-white border border-rose-200 rounded-xl text-rose-600">
                    &lt;Wizard initialStepId={"{params.id}"} config={"{cfg}"} /&gt;<br/>
                    <span className="text-[8px] italic opacity-60 opacity-60 text-gray-400">// Anyone can type /wizard/admin-only in address bar</span>
                </div>
            </div>
            <div className="space-y-2">
                <h5 className="font-bold text-gray-800 text-sm">✅ Pro-Active</h5>
                <div className="text-[10px] font-mono p-4 bg-white border border-emerald-200 rounded-xl text-emerald-700">
                    &lt;Wizard <br/>
                    &nbsp;&nbsp;initialStepId={"{params.id}"} <br/>
                    &nbsp;&nbsp;config={"{cfg}"} <br/>
                    &nbsp;&nbsp;onAuth={"{checkPermissions}"}<br/>
                    /&gt;
                </div>
            </div>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Step Rendering", href: "/docs/rendering" }}
        next={{ label: "Performance", href: "/docs/performance" }}
      />
    </div>
  );
}
