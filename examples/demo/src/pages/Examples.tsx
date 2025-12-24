import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

export default function Examples() {
  const examples = [
    {
      title: "Simple JS Wizard",
      description: "The easiest way to get started with no external form libraries.",
      path: "/simple",
      icon: "✨",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "RHF + Zod",
      description: "Full-featured forms with React Hook Form and Zod validation.",
      path: "/rhf-zod",
      icon: "🛡️",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Formik + Yup",
      description: "Classic enterprise-grade forms with Formik and Yup.",
      path: "/formik-yup",
      icon: "📦",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Conditional Flow",
      description: "Complex multi-step logic based on user interaction.",
      path: "/conditional",
      icon: "🔀",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Complex Data",
      description: "Manage nested objects and arrays with deep path updates.",
      path: "/complex",
      icon: "📊",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Advanced Features",
      description: "Autofill, Declarative Rendering, and Mixed Persistence.",
      path: "/advanced",
      icon: "🚀",
      color: "bg-rose-50 text-rose-600",
    },
    {
        title: "Legacy Integration",
        description: "How to use with class components or older React versions.",
        path: "/legacy",
        icon: "🦖",
        color: "bg-gray-50 text-gray-600",
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Examples Gallery
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          See how the library integrates with your favorite tools and handles complex scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example) => (
          <Link
            key={example.path}
            to={example.path}
            className="group flex transition-transform hover:-translate-y-1"
          >
            <Card className="flex-1 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${example.color}`}
                >
                  {example.icon}
                </div>
                <div>
                  <CardTitle className="group-hover:text-indigo-600 transition-colors text-lg">
                    {example.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">{example.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
