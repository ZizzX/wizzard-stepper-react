import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Home() {
  const features = [
    {
      title: "Simple JS Wizard",
      description:
        "The easiest way to get started with no external form libraries.",
      path: "/simple",
      icon: "✨",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "RHF + Zod",
      description:
        "Full-featured forms with React Hook Form and Zod validation.",
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
      description:
        "Autofill, Declarative Rendering, and Mixed Persistence (RAM + LocalStorage).",
      path: "/advanced",
      icon: "🚀",
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="space-y-16 py-10">
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Build Perfect <span className="text-indigo-600">Multi-Step</span>{" "}
          Experiences
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          A flexible, headless wizard stepper for React. Persistence,
          validation, and complex flows made simple.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            onClick={() =>
              window.open(
                "https://github.com/ZizzX/wizzard-stepper-react",
                "_blank"
              )
            }
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            View Examples
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="group transition-transform hover:-translate-y-1"
          >
            <Card className="h-full border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <div>
                  <CardTitle className="group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="bg-indigo-900 rounded-3xl p-12 text-center text-white space-y-6">
        <h2 className="text-3xl font-bold">Ready to integrate?</h2>
        <p className="text-indigo-200 text-lg max-w-xl mx-auto">
          Install the core package and start building your next user onboarding
          flow in minutes.
        </p>
        <div className="bg-indigo-950/50 p-4 rounded-xl font-mono text-indigo-300 inline-block">
          npm install wizzard-stepper-react
        </div>
      </section>
    </div>
  );
}
