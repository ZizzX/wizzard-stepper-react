import DocsNavigation from "../../components/DocsNavigation";
import { ProTip } from "../../components/ProTip";

export default function PerformanceDocs() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Performance Optimization
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Learn how to build blazing fast wizards that scale to hundreds of fields
          and maintain 60FPS even on low-end devices.
        </p>
      </div>

      {/* 1. Stateless Architecture */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Stateless Provider Model</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            By default, the <code>WizardProvider</code> is "stateless" regarding your data. 
            Changing a field value <strong>does not</strong> re-render the entire provider. Instead, it only notifies components specifically subscribed to that data path.
          </p>
          <p>
            This ensures that typing in a long form feels instantaneous, as only the specific input component re-renders.
          </p>
        </div>
      </section>

      {/* 2. O(1) Lookups */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Hash-Map Lookups</h2>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p>
            Internal logic for finding step configurations and indices uses <strong>Hash Maps</strong> (<code>O(1)</code>) instead of array iteration (<code>O(n)</code>).
          </p>
          <ul>
            <li><strong>Instant Step Access</strong>: Access any step config by ID without searching the steps array.</li>
            <li><strong>Scalable Navigation</strong>: Check <code>isFirstStep</code> or <code>isLastStep</code> instantly, regardless of wizard size.</li>
          </ul>
        </div>
      </section>

      {/* 3. Handling Large Lists */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">3</div>
          <h2 className="text-2xl font-bold text-gray-900">Large Dataset Strategies</h2>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Restoration with isLoading</h3>
          <p className="text-gray-600">
            When restoring data from <code>LocalStorage</code>, the library provides an <code>isLoading</code> state. Use this to show a skeleton loader and prevent layout shift.
          </p>
          <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
            <pre className="text-gray-300">
              <span className="text-purple-400">const</span> <span className="text-indigo-400">{"{ currentStep, isLoading }"}</span> <span className="text-emerald-400">=</span> <span className="text-blue-400">useWizardState</span><span className="text-emerald-400">();</span>{"\n\n"}
              <span className="text-purple-400">if</span> <span className="text-emerald-400">(</span><span className="text-indigo-400">isLoading</span><span className="text-emerald-400">)</span> <span className="text-emerald-400">{"{"}</span>{"\n"}
              {"  "}<span className="text-purple-400">return</span> <span className="text-emerald-400">&lt;</span><span className="text-blue-300">SkeletonLoader</span> <span className="text-emerald-400">/&gt;;</span>{"\n"}
              <span className="text-emerald-400">{"}"}</span>
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Deferred Rendering</h3>
          <p className="text-gray-600">
            For steps with hundreds of items (e.g., repeating fields), browser performance can degrade due to massive simultaneous mounting. Use a <strong>Deferred List</strong> pattern to render items in small chunks.
          </p>
          <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs overflow-x-auto shadow-xl ring-1 ring-white/10">
            <pre className="text-gray-300 text-xs">
{`// Example of a simple DeferredList implementation
export function DeferredList<T>({ items, renderItem, chunkSize = 10 }) {
  const [visibleCount, setVisibleCount] = useState(chunkSize);

  useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + chunkSize);
      }, 16); // ~1 frame
      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length]);

  return <>{items.slice(0, visibleCount).map(renderItem)}</>;
}`}
            </pre>
          </div>
        </div>
      </section>

      <ProTip>
        Always use <code>useWizardSelector</code> with <code>shallowEqual</code> when returning objects or arrays. 
        This prevents redundant re-renders when other parts of the store update.
      </ProTip>

      <DocsNavigation 
        prev={{ label: "Security & Integrity", href: "/docs/security" }}
        next={{ label: "React Hook Form", href: "/docs/rhf" }}
      />
    </div>
  );
}
