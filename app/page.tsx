import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import Image from "next/image";
import Link from "next/link";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="font-bold text-xl">QentSolutions</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
            <LoginButton>
              <Button variant="outline" size="sm">Sign in</Button>
            </LoginButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Streamline Your Workflow
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The all-in-one collaboration platform for teams. Manage projects, track tasks, and achieve goals together.
          </p>
          <div className="flex gap-4 justify-center">
            <LoginButton>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
              </Button>
            </LoginButton>
            <Button size="lg" variant="outline">
              Book a Demo
            </Button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            No credit card required · Free 14-day trial
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Task Management",
                description: "Create, assign, and track tasks with ease. Keep your team aligned and productive.",
                icon: "📋"
              },
              {
                title: "Real-time Collaboration",
                description: "Work together seamlessly with real-time updates and communication tools.",
                icon: "🤝"
              },
              {
                title: "Analytics & Insights",
                description: "Make data-driven decisions with powerful analytics and reporting features.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by innovative teams</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((company, index) => (
              <div key={index} className="text-xl font-bold">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Features</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Security</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">About</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Careers</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Blog</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Documentation</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Help Center</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy-policy" className="block text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link>
                <Link href="/terms-of-use" className="block text-sm text-gray-600 hover:text-gray-900">Terms of Use</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            © {new Date().getFullYear()} QentSolutions. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}