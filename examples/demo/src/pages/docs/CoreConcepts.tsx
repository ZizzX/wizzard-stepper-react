export default function CoreConcepts() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Core Concepts
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Understanding the building blocks of `wizzard-stepper-react`.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">The Factory</h2>
        <p className="text-gray-600">
          Everything starts with the factory. It creates a set of hooks and a Provider that are scoped to your specific data schema.
        </p>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl">
          <pre className="text-indigo-300">
{`const { WizardProvider, useWizard } = createWizardFactory<MySchema>();`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Dynamic Steps</h2>
        <p className="text-gray-600">
          Steps are defined in the config. They can be conditional, meaning they only appear if certain data criteria are met.
        </p>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl">
          <pre className="text-indigo-300">
{`{
  id: "payment",
  label: "Payment Info",
  condition: (data) => data.isPaidVersion // Only show if user chose paid
}`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Headless Hooks</h2>
        <p className="text-gray-600">
          We provide several hooks for fine-grained control and performance optimization:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <code className="text-indigo-600 font-bold">useWizard</code>
            <p className="text-xs text-gray-500 mt-1">Full access to state and actions.</p>
          </li>
          <li className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <code className="text-indigo-600 font-bold">useWizardValue</code>
            <p className="text-xs text-gray-500 mt-1">Read-only access to wizard data.</p>
          </li>
          <li className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <code className="text-indigo-600 font-bold">useWizardActions</code>
            <p className="text-xs text-gray-500 mt-1">Functions to trigger changes.</p>
          </li>
          <li className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <code className="text-indigo-600 font-bold">useWizardSelector</code>
            <p className="text-xs text-gray-500 mt-1">Select specific pieces of data to prevent re-renders.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
