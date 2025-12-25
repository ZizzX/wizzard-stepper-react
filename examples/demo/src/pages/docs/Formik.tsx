import DocsNavigation from "../../components/DocsNavigation";
import { ProTip } from "../../components/ProTip";

export default function FormikDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Formik
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
          Classic, declarative form management for Wizards. Learn how to map 
          the Formik ecosystem to our step orchestration.
        </p>
      </section>

      {/* 1. Component Pattern */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Declarative Components</h2>
        </div>
        <p className="text-gray-600">
          Formik's <code className="text-blue-600 bg-blue-50 px-1 rounded font-mono">&lt;Formik&gt;</code> 
          provider should typically be scoped to a single Step. This allows each 
          step to have its own lifecycle and validation schema.
        </p>

        <ProTip>
          If your Formik schemas are complex, use <code className="text-blue-900 font-bold">manual</code> persistence mode. 
          This ensures that data is only persisted when the user clicks "Next", preventing 
          intermediate invalid state from being saved to LocalStorage.
        </ProTip>

        <div className="bg-gray-900 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <div className="bg-gray-800/50 px-6 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">BillingStep.tsx</span>
          </div>
          <div className="p-8 font-mono text-[13px] leading-relaxed">
            <div className="space-y-1 text-gray-300">
              <div><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">Formik</span></div>
              <div className="pl-4"><span className="text-sky-300">initialValues</span><span className="text-emerald-400">=</span><span className="text-emerald-400">{"{"}</span><span className="text-indigo-300">useWizardValue</span><span className="text-emerald-400">(</span><span className="text-amber-300">'billing'</span><span className="text-emerald-400">)</span><span className="text-emerald-400">{"}"}</span></div>
              <div className="pl-4"><span className="text-sky-300">validationSchema</span><span className="text-emerald-400">=</span><span className="text-emerald-400">{"{"}</span><span className="text-indigo-300">billingSchema</span><span className="text-emerald-400">{"}"}</span></div>
              <div className="pl-4"><span className="text-sky-300">onSubmit</span><span className="text-emerald-400">=</span><span className="text-emerald-400">{"{"}</span><span className="text-emerald-400">(</span><span className="text-indigo-300">values</span><span className="text-emerald-400">)</span> <span className="text-purple-400">=&gt;</span> <span className="text-emerald-400">{"{"}</span></div>
              <div className="pl-8"><span className="text-indigo-300">setData</span><span className="text-emerald-400">(</span><span className="text-amber-300">'billing'</span><span className="text-emerald-400">,</span> <span className="text-indigo-300">values</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
              <div className="pl-8"><span className="text-indigo-300">goToNextStep</span><span className="text-emerald-400">(</span><span className="text-emerald-400">)</span><span className="text-emerald-400">;</span></div>
              <div className="pl-4"><span className="text-emerald-400">{"}}"}</span></div>
              <div className="text-emerald-400">&gt;</div>
              <div className="pl-4"><span className="text-emerald-400">{"{({ "}</span><span className="text-indigo-300">handleSubmit</span><span className="text-emerald-400">{" }) => ("}</span></div>
              <div className="pl-8"><span className="text-emerald-400">&lt;</span><span className="text-indigo-300">form</span> <span className="text-sky-300">onSubmit</span><span className="text-emerald-400">=</span><span className="text-emerald-400">{"{"}</span><span className="text-indigo-300">handleSubmit</span><span className="text-emerald-400">{"}"}</span><span className="text-emerald-400">&gt;</span></div>
              <div className="pl-12 text-gray-500 italic">// Formik Fields here...</div>
              <div className="pl-8"><span className="text-emerald-400">&lt;/</span><span className="text-indigo-300">form</span><span className="text-emerald-400">&gt;</span></div>
              <div className="pl-4"><span className="text-emerald-400">{")}"}</span></div>
              <div><span className="text-emerald-400">&lt;/</span><span className="text-indigo-300">Formik</span><span className="text-emerald-400">&gt;</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Advantage Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">Schema Reuse</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
                Directly use your existing Yup schemas within the wizard without any modifications.
            </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">Type Safety</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
                Combine Formik generics with our <code className="text-indigo-500 font-bold">IWizardConfig</code> for end-to-end safety.
            </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h4 className="font-bold text-gray-900">State Snapshot</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
                Use <code className="text-indigo-500 font-bold">manual</code> persistence mode to only save confirmed Formik data.
            </p>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "React Hook Form", href: "/docs/rhf" }}
        next={{ label: "Mantine Form", href: "/docs/mantine" }}
      />
    </div>
  );
}
