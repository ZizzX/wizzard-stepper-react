export default function Introduction() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Introduction
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          A flexible, headless, and strictly typed multi-step wizard library for React.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Headless by Design</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            We provide the logic, state management, and orchestration. You bring the UI. Works perfectly with Tailwind, Shadcn, or your own design system.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Strictly Typed</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Built with TypeScript first. Enjoy full autocomplete and type safety for your wizard data and step definitions.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Battle Tested</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Includes built-in support for Formik, React Hook Form, Zod, and Yup. Handle complex validation and persistent state with ease.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Extensible</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Customize everything from persistence adapters (LocalStorage, URL, RAM) to validation strategies and navigation logic.
          </p>
        </div>
      </div>

      <section className="space-y-4 pt-10">
        <h2 className="text-2xl font-bold text-gray-900">Why another wizard library?</h2>
        <p className="text-gray-600 leading-relaxed">
          Many existing solutions are either too prescriptive with their UI, or too simple to handle real-world needs like asynchronous validation, state persistence across page reloads, or complex conditional steps.
        </p>
        <p className="text-gray-600 leading-relaxed">
          <code className="text-indigo-600 font-bold">wizzard-stepper-react</code> was built to solve these problems while remaining lightweight and unopinionated about your components.
        </p>
      </section>
    </div>
  );
}
