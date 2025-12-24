import DocsNavigation from "../../components/DocsNavigation";
export default function HooksApi() {
  const hooks = [
    {
      name: "useWizard",
      desc: "The 'All-in-One' hook. Returns the complete context. Best for small wizards or when you need both state and actions in one component.",
      code: "const { currentStep, wizardData, goToNextStep, ... } = useWizard();",
      color: "indigo",
    },
    {
      name: "useWizardValue",
      desc: "Performance king. Subscribes to a specific data path using dot-notation. Component only re-renders when this specific value changes.",
      code: "const name = useWizardValue('user.personal.name');",
      color: "emerald",
    },
    {
      name: "useWizardActions",
      desc: "Purely for logic. Returns methods like setData, goToStep, and validate. Use this in headers or navigation bars to keep them decoupled from data.",
      code: "const { setData, goToNextStep, save } = useWizardActions();",
      color: "rose",
    },
    {
      name: "useWizardSelector",
      desc: "Advanced selection logic. Pass a function to select and transform a slice of state. React-Redux style.",
      code: "const totalCost = useWizardSelector(state => calculateTotal(state.items));",
      color: "amber",
    },
    {
      name: "useWizardError",
      desc: "The easiest way to display validation messages. Returns the error string for a specific field path if it exists.",
      code: "const emailErrorMessage = useWizardError('account.email');",
      color: "red",
    },
    {
      name: "useWizardState",
      desc: "Access the UI-specific state of the wizard. Great for building custom Progress Bars, Sidebars, or HUDs.",
      code: "const { visitedSteps, isLastStep, isLoading } = useWizardState();",
      color: "cyan",
    },
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Hooks API
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Granular hooks for high performance and clean code. Every hook is
          automatically typed based on your factory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {hooks.map((hook) => (
          <section
            key={hook.name}
            className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 bg-${hook.color}-500 rounded-full`} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {hook.name}
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{hook.desc}</p>
                <div className="bg-gray-950 rounded-xl p-5 font-mono text-sm overflow-x-auto">
                  <code className="text-gray-300">{hook.code}</code>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
          Advanced Patterns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Granular Updates
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              When using <code className="text-xs">setData</code>, you should
              provide a full dot-notation path. This allows the wizard to
              efficiently update only the necessary slice of the store and
              notify only the relevant subscribers.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs">
              setData('users[0].address.city', 'London')
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Handling Async Actions
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Most navigation actions like <code className="text-xs">goToNextStep</code> 
              and <code className="text-xs">goToStep</code> are asynchronous. They return 
              a promise that resolves once validation (if any) is complete.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs text-indigo-600">
              {`const success = await goToNextStep();
if (!success) {
  toast.error("Please fix errors first!");
}`}
            </div>
          </div>
        </div>
      </section>

      <section className="p-8 bg-indigo-950 rounded-3xl text-white space-y-6">
        <h2 className="text-2xl font-bold">The Performance Secret</h2>
        <p className="text-indigo-200 leading-relaxed">
          Unlike many other wizard libraries, `wizzard-stepper-react` uses 
          <strong> React 18's useSyncExternalStore</strong> under the hood. 
          This means that while the core state is a single large object, 
          your components are only "subscribed" to the specific paths they 
          need.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
            Zero Re-renders for Unrelated Fields
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
            Optimized Selectors
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
            Hydration Friendly
          </div>
        </div>
      </section>
      
      <DocsNavigation 
        prev={{ label: "Core Concepts", href: "/docs/concepts" }}
      />
    </div>
  );
}
