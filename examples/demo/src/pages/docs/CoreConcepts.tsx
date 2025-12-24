import DocsNavigation from "../../components/DocsNavigation";

export default function CoreConcepts() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Core Concepts
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Everything you need to know about the architecture and building blocks
          of <code className="text-indigo-600 bg-indigo-50 px-1 rounded">wizzard-stepper-react</code>.
        </p>
      </div>

      {/* 1. The Factory Pattern */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">1</div>
          <h2 className="text-2xl font-bold text-gray-900">The Factory Pattern</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            The library uses a <strong>Factory Pattern</strong> to provide 100% type safety. Instead of using generic hooks that require manual casting, you create a dedicated "Wizard Kit" for your specific data schema.
          </p>
        </div>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
          <pre className="space-y-1">
            <div className="text-purple-400">import <span className="text-gray-400">{"{ "}</span> <span className="text-indigo-400">createWizardFactory</span> <span className="text-gray-400">{" }"}</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'wizzard-stepper-react'</span>;</div>
            <div className="mt-4 text-purple-400">interface <span className="text-amber-400">UserSchema</span> <span className="text-gray-400">{"{"}</span></div>
            <div className="pl-4 text-gray-300">
              <span className="text-indigo-400">personal</span><span className="text-gray-400">:</span> <span className="text-gray-400">{"{ "}</span> <span className="text-indigo-400">name</span><span className="text-gray-400">:</span> <span className="text-rose-400">string</span>; <span className="text-indigo-400">age</span><span className="text-gray-400">:</span> <span className="text-rose-400">number</span> <span className="text-gray-400">{" };"}</span>
            </div>
            <div className="pl-4 text-gray-300">
              <span className="text-indigo-400">account</span><span className="text-gray-400">:</span> <span className="text-gray-400">{"{ "}</span> <span className="text-indigo-400">email</span><span className="text-gray-400">:</span> <span className="text-rose-400">string</span> <span className="text-gray-400">{" };"}</span>
            </div>
            <div className="text-gray-400">{"}"}</div>
            <div className="mt-4 text-gray-500">// Generates typed hooks and Provider</div>
            <div className="text-purple-400">export const <span className="text-gray-400">{"{ "}</span></div>
            <div className="pl-4 text-indigo-400">
              WizardProvider, 
              useWizard, 
              useWizardValue,
              createStep 
            </div>
            <div className="text-purple-400"><span className="text-gray-400">{"}"}</span> = <span className="text-indigo-400">createWizardFactory</span>&lt;<span className="text-amber-400">UserSchema</span>&gt;();</div>
          </pre>
        </div>
      </section>

      {/* 2. Step Configuration */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Step Logic</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            Steps are more than just a list. They support <strong>conditional branching</strong>, <strong>custom validation</strong>, and <strong>component mapping</strong>.
          </p>
        </div>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
          <pre className="space-y-1">
            <div className="text-purple-400">const <span className="text-indigo-400">config</span> = <span className="text-gray-400">{"{"}</span></div>
            <div className="pl-4 text-indigo-400">steps<span className="text-gray-400">: [</span></div>
            <div className="pl-8 text-gray-300"><span className="text-gray-400">{"{ "}</span> <span className="text-indigo-400">id</span><span className="text-gray-400">:</span> <span className="text-amber-400">"intro"</span><span className="text-gray-400">,</span> <span className="text-indigo-400">label</span><span className="text-gray-400">:</span> <span className="text-amber-400">"Welcome"</span> <span className="text-gray-400">{" },"}</span></div>
            <div className="pl-8 text-gray-400">{"{"}</div>
            <div className="pl-12 text-gray-300"><span className="text-indigo-400">id</span><span className="text-gray-400">:</span> <span className="text-amber-400">"payment"</span><span className="text-gray-400">,</span></div>
            <div className="pl-12 text-gray-300"><span className="text-indigo-400">label</span><span className="text-gray-400">:</span> <span className="text-amber-400">"Payment"</span><span className="text-gray-400">,</span></div>
            <div className="pl-12 text-gray-500">// Automagically skipped if condition is false</div>
            <div className="pl-12 text-indigo-400"><span className="text-indigo-400">condition</span><span className="text-gray-400">: (</span>data<span className="text-gray-400">) =&gt;</span> data.plan <span className="text-purple-400">!==</span> <span className="text-amber-400">'free'</span><span className="text-gray-400">,</span></div>
            <div className="pl-12 text-gray-300"><span className="text-indigo-400">validationAdapter</span><span className="text-gray-400">:</span> <span className="text-purple-400">new</span> <span className="text-amber-400">ZodAdapter</span><span className="text-gray-400">(</span>paymentSchema<span className="text-gray-400">),</span></div>
            <div className="pl-8 text-gray-400">{"}"}</div>
            <div className="pl-4 text-gray-400">]<span className="text-gray-400">,</span></div>
            <div className="pl-4 text-gray-500">// Global config</div>
            <div className="pl-4 text-gray-300"><span className="text-indigo-400">autoValidate</span><span className="text-gray-400">:</span> <span className="text-rose-400">true</span><span className="text-gray-400">,</span></div>
            <div className="pl-4 text-gray-300"><span className="text-indigo-400">onStepChange</span><span className="text-gray-400">: (</span><span className="text-indigo-300">from</span><span className="text-gray-400">,</span> <span className="text-indigo-300">to</span><span className="text-gray-400">) =&gt;</span> <span className="text-indigo-400">console</span>.<span className="text-indigo-400">log</span><span className="text-gray-400">(</span><span className="text-amber-400">"Moved from "</span> <span className="text-purple-400">+</span> <span className="text-indigo-300">from</span> <span className="text-purple-400">+</span> <span className="text-amber-400">" to "</span> <span className="text-purple-400">+</span> <span className="text-indigo-300">to</span><span className="text-gray-400">)</span></div>
            <div className="text-gray-400">{"};"}</div>
          </pre>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Conditions</h4>
            <p className="text-sm text-gray-500 line-clamp-3">
              Dynamic routing based on accumulated wizard data. Steps
              disappear/appear in real-time.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Validation</h4>
            <p className="text-sm text-gray-500 line-clamp-3">
              Attach Zod or Yup adapters to specific steps. Next button is
              blocked until valid.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Lifecycle</h4>
            <p className="text-sm text-gray-500 line-clamp-3">
              Use <code className="text-xs">onStepChange</code> for analytics,
              routing, or triggering side effects.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Deep-Dive: Step Status */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tracking Progress</h2>
        </div>
        <p className="text-gray-600">
          The wizard automatically tracks the status of every step in the flow.
          You can use these sets to build rich sidebars, progress bars, or
          checkmarks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <code className="text-indigo-700 font-bold block mb-2">
              visitedSteps
            </code>
            <p className="text-xs text-indigo-600/80">
              Steps the user has physically landed on.
            </p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <code className="text-emerald-700 font-bold block mb-2">
              completedSteps
            </code>
            <p className="text-xs text-emerald-600/80">
              Steps successfully submitted via{" "}
              <code className="text-xs">goToNextStep</code>.
            </p>
          </div>
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
            <code className="text-rose-700 font-bold block mb-2">
              errorSteps
            </code>
            <p className="text-xs text-rose-600/80">
              Steps with active validation errors that need attention.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Global vs Step State */}
      <section className="space-y-6 bg-gray-50 -mx-6 px-6 py-12 md:rounded-3xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-bold">
            4
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Data Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              The wizard maintains a single <strong>Unified State</strong>.
              Unlike traditional forms where each page has its own state,
              `wizzard-stepper-react` keeps everything in one place.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                No data lost between transitions
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Cross-step validation support
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Dot-notation updates: <code className="text-xs">setData('user.profile.bio', '...')</code>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm font-mono text-xs">
            <div className="text-gray-400 mb-2">// Atomic Updates</div>
            <div className="text-emerald-600">{"{"}</div>
            <div className="pl-4">
              <span className="text-indigo-600">"personal"</span>: {"{ "}{" "}
              <span className="text-rose-600">"name"</span>:{" "}
              <span className="text-amber-600">"John"</span>
              {" },"}
            </div>
            <div className="pl-4">
              <span className="text-indigo-600">"plan"</span>:{" "}
              <span className="text-amber-600">"premium"</span>,
            </div>
            <div className="pl-4">
              <span className="text-indigo-600">"payment"</span>: {"{ ... }"}
            </div>
            <div className="text-emerald-600">{"}"}</div>
          </div>
        </div>
      </section>

      {/* 5. Validation Deep-Dive */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">
            5
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Validation Adapters
          </h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            We are library-agnostic when it comes to validation. Whether you use <strong>Zod</strong>, <strong>Yup</strong>, or <strong>plain functions</strong>, it just works as long as it satisfies the <code className="text-indigo-600">IValidatorAdapter</code> interface.
          </p>
        </div>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
          <div className="text-gray-500 mb-2">// The mandatory interface for all adapters</div>
          <pre className="space-y-1">
            <div className="text-purple-400">interface <span className="text-amber-400">IValidatorAdapter</span><span className="text-gray-400">&lt;</span><span className="text-indigo-300">TData</span><span className="text-gray-400">&gt;</span> <span className="text-gray-400">{"{"}</span></div>
            <div className="pl-4 text-gray-300">
               <span className="text-indigo-400">validate</span><span className="text-gray-400">: (</span>data<span className="text-gray-400">:</span> <span className="text-indigo-300">TData</span><span className="text-gray-400">) =&gt;</span> <span className="text-rose-400">Promise</span><span className="text-gray-400">&lt;</span><span className="text-amber-400">ValidationResult</span><span className="text-gray-400">&gt;</span> <span className="text-gray-400">|</span> <span className="text-amber-400">ValidationResult</span><span className="text-gray-400">;</span>
            </div>
            <div className="text-gray-400">{"}"}</div>
            
            <div className="mt-4 text-purple-400">type <span className="text-amber-400">ValidationResult</span> = <span className="text-gray-400">{"{"}</span></div>
            <div className="pl-4 text-gray-300">
               <span className="text-indigo-400">isValid</span><span className="text-gray-400">:</span> <span className="text-rose-400">boolean</span><span className="text-gray-400">;</span>
            </div>
            <div className="pl-4 text-gray-300">
               <span className="text-indigo-400">errors</span><span className="text-gray-400">?:</span> <span className="text-rose-400">Record</span><span className="text-gray-400">&lt;</span><span className="text-rose-400">string</span><span className="text-gray-400">,</span> <span className="text-rose-400">string</span><span className="text-gray-400">&gt;;</span> <span className="text-gray-500">// {"{ \"field.path\": \"Message\" }"}</span>
            </div>
            <div className="text-gray-400">{"}"}</div>
          </pre>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                Official
              </span>
              Standard Adapters
            </h4>
            <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
              <pre className="space-y-3">
                <div className="text-gray-300">
                  <span className="text-purple-400">new</span> <span className="text-amber-400">ZodAdapter</span><span className="text-gray-400">(</span>schema<span className="text-gray-400">)</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-purple-400">new</span> <span className="text-amber-400">YupAdapter</span><span className="text-gray-400">(</span>schema<span className="text-gray-400">)</span>
                </div>
              </pre>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                Custom
              </span>
              Hand-written
            </h4>
            <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
              <pre className="space-y-1">
                <div className="text-purple-400">
                  const <span className="text-indigo-400">myAdapter</span>: <span className="text-amber-400">IValidatorAdapter</span>&lt;<span className="text-indigo-300">MyData</span>&gt; = <span className="text-gray-400">{"{"}</span>
                </div>
                <div className="pl-4">
                  <span className="text-indigo-400">validate</span><span className="text-gray-400">:</span> <span className="text-gray-400">(</span><span className="text-indigo-300">data</span><span className="text-gray-400">)</span> <span className="text-purple-400">=&gt;</span> <span className="text-gray-400">{"{"}</span>
                </div>
                <div className="pl-8 text-gray-300">
                  <span className="text-purple-400">if</span> <span className="text-gray-400">(</span><span className="text-gray-400">!</span>data.email?.<span className="text-indigo-400">includes</span><span className="text-gray-400">(</span><span className="text-amber-400">'@'</span><span className="text-gray-400">)</span><span className="text-gray-400">)</span> <span className="text-gray-400">{"{"}</span>
                </div>
                <div className="pl-12">
                  <span className="text-purple-400">return</span> <span className="text-gray-400">{"{"}</span>
                </div>
                <div className="pl-16 text-gray-300">
                  <span className="text-indigo-400">isValid</span><span className="text-gray-400">:</span> <span className="text-rose-400">false</span><span className="text-gray-400">,</span>
                </div>
                <div className="pl-16 text-gray-300">
                  <span className="text-indigo-400">errors</span><span className="text-gray-400">:</span> <span className="text-gray-400">{"{"}</span> <span className="text-indigo-400">email</span><span className="text-gray-400">:</span> <span className="text-amber-400">"Invalid email"</span> <span className="text-gray-400">{"}"}</span>
                </div>
                <div className="pl-12 text-gray-400">{"};"}</div>
                <div className="pl-8 text-gray-400">{"}"}</div>
                <div className="pl-8">
                  <span className="text-purple-400">return</span> <span className="text-gray-400">{"{"}</span> <span className="text-indigo-400">isValid</span><span className="text-gray-400">:</span> <span className="text-rose-400">true</span> <span className="text-gray-400">{"}"}</span><span className="text-gray-400">;</span>
                </div>
                <div className="pl-4 text-gray-400">{"}"}</div>
                <div className="text-gray-400">{"};"}</div>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Persistence Strategies */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold">
            6
          </div>
          <h2 className="text-2xl font-bold text-gray-900">State Persistence</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            Choose when and where to save your data. You can even mix-and-match adapters (e.g., save most steps to Memory but the "Payment" step to LocalStorage).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <h4 className="font-bold text-gray-900">Persistence Modes</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <code className="text-indigo-600">onStepChange</code>
                <span className="text-gray-400">Save after navigating</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <code className="text-indigo-600">onChange</code>
                <span className="text-gray-400">Save every keystroke</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <code className="text-indigo-600">manual</code>
                <span className="text-gray-400">Call save() manually</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <h4 className="font-bold text-gray-900">Adapters</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-amber-500" />
                 <strong>LocalStorageAdapter</strong>: Persistent between sessions.
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-amber-500" />
                 <strong>MemoryAdapter</strong>: Volatile, great for testing.
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-amber-500" />
                 <strong>CustomAdapter</strong>: Hook into APIs or DBs.
              </div>
            </div>
          </div>
        </div>

        {/* Custom Persistence Adapter Implementation */}
        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Custom</span>
            Building a Persistence Adapter
          </h4>
          <p className="text-sm text-gray-600">
            To build a custom adapter (e.g., for Firebase or Redis), implement the <code className="text-indigo-600">IPersistenceAdapter</code> interface.
          </p>
          <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
            <pre className="space-y-1">
              <div className="text-purple-400">interface <span className="text-amber-400">IPersistenceAdapter</span> <span className="text-gray-400">{"{"}</span></div>
              <div className="pl-4 text-gray-300">
                <span className="text-indigo-400">saveStep</span><span className="text-gray-400">: &lt;</span><span className="text-indigo-300">T</span><span className="text-gray-400">&gt;(</span>stepId<span className="text-gray-400">:</span> <span className="text-rose-400">string</span><span className="text-gray-400">,</span> data<span className="text-gray-400">:</span> <span className="text-indigo-300">T</span><span className="text-gray-400">) =&gt;</span> <span className="text-rose-400">void</span><span className="text-gray-400">;</span>
              </div>
              <div className="pl-4 text-gray-300">
                <span className="text-indigo-400">getStep</span><span className="text-gray-400">: &lt;</span><span className="text-indigo-300">T</span><span className="text-gray-400">&gt;(</span>stepId<span className="text-gray-400">:</span> <span className="text-rose-400">string</span><span className="text-gray-400">) =&gt;</span> <span className="text-indigo-300">T</span> <span className="text-gray-400">|</span> <span className="text-rose-400">undefined</span><span className="text-gray-400">;</span>
              </div>
              <div className="pl-4 text-gray-300">
                <span className="text-indigo-400">clear</span><span className="text-gray-400">: () =&gt;</span> <span className="text-rose-400">void</span><span className="text-gray-400">;</span>
              </div>
              <div className="text-gray-400">{"}"}</div>

              <div className="mt-6 text-purple-400">class <span className="text-amber-400">CloudAdapter</span> <span className="text-purple-400">implements</span> <span className="text-amber-400">IPersistenceAdapter</span> <span className="text-gray-400">{"{"}</span></div>
              <div className="pl-4">
                <span className="text-indigo-400">saveStep</span><span className="text-gray-400">(</span><span className="text-indigo-300">stepId</span><span className="text-gray-400">,</span> <span className="text-indigo-300">data</span><span className="text-gray-400">) {"{"}</span>
              </div>
              <div className="pl-8 text-gray-500">// Sync with cloud database</div>
              <div className="pl-8 text-gray-300"><span className="text-indigo-400">api</span>.<span className="text-indigo-300">post</span><span className="text-gray-400">(</span><span className="text-amber-400">"/steps/" + </span><span className="text-indigo-300">stepId</span><span className="text-gray-400">,</span> <span className="text-indigo-300">data</span><span className="text-gray-400">);</span></div>
              <div className="pl-4 text-gray-400">{"}"}</div>
              <div className="pl-4">
                <span className="text-indigo-400">getStep</span><span className="text-gray-400">(</span><span className="text-indigo-300">stepId</span><span className="text-gray-400">) {"{"} /* ... */ {"}"}</span>
              </div>
              <div className="pl-4 text-gray-300">
                <span className="text-indigo-400">clear</span><span className="text-gray-400">() {"{"} /* ... */ {"}"}</span>
              </div>
              <div className="text-gray-400">{"}"}</div>
            </pre>
          </div>
        </div>
      </section>

      {/* 7. Hydration & Entry Points */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">7</div>
          <h2 className="text-2xl font-bold text-gray-900">Hydration & Entry Points</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            You can seed the wizard with data from your API or start users at a specific step. This is essential for "Edit" flows or "Save & Resume" features.
          </p>
        </div>
        <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
          <pre className="space-y-1">
            <div className="text-gray-300">&lt;<span className="text-amber-400">WizardProvider</span></div>
            <div className="pl-4 text-gray-300"><span className="text-indigo-400">config</span>={"{"}<span className="text-indigo-300">config</span>{"}"}</div>
            <div className="pl-4 text-gray-300"><span className="text-indigo-400">initialData</span>={"{ { "}<span className="text-indigo-400">name</span>: <span className="text-amber-400">"Aziz"</span>, <span className="text-indigo-400">email</span>: <span className="text-amber-400">"..."</span> {" } }"} <span className="text-gray-500">// Prefill from API</span></div>
            <div className="pl-4 text-gray-300"><span className="text-indigo-400">initialStepId</span>=<span className="text-amber-400">"payment"</span> <span className="text-gray-500">// Deep-link</span></div>
            <div className="text-gray-300">&gt;</div>
            <div className="pl-4 text-gray-300">&lt;<span className="text-amber-400">MyWizard</span> /&gt;</div>
            <div className="text-gray-300">&lt;/<span className="text-amber-400">WizardProvider</span>&gt;</div>
          </pre>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
           <div className="text-2xl">💡</div>
           <div className="text-sm text-blue-800 leading-relaxed">
             <strong>Pro Tip:</strong> When using <code className="text-xs">initialStepId</code>, the wizard is smart enough to still run conditions for previous steps to ensure the state remains consistent.
           </div>
        </div>
      </section>

      {/* Navigation */}
      <DocsNavigation 
        prev={{ label: "Quick Start", href: "/docs/quickstart" }}
        next={{ label: "Hooks API", href: "/docs/hooks" }} 
      />
    </div>
  );
}
