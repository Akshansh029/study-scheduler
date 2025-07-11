import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  Repeat,
  BookOpen,
  Lightbulb,
  BarChart3,
  GraduationCap,
  Github,
} from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">SlotWise</span>
              <div className="-mt-1 text-xs text-gray-500">
                Science-Based Learning
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              How it Works
            </Link>
            <Link
              href="#science"
              className="font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              The Science
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="cursor-pointer">
              <SignInButton />
            </Button>
            <Button asChild className="cursor-pointer">
              <SignUpButton />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white px-4 py-12">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 border-indigo-200 bg-indigo-100 text-indigo-700"
          >
            <GraduationCap className="mr-1" size={40} />
            Built for Students
          </Badge>

          <h1 className="mb-8 text-5xl leading-tight font-bold text-gray-900 md:text-7xl">
            Remember Everything
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              You Study
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl">
            SlotWise uses proven neuroscience techniques to help you retain 80%
            more information while studying 50% less. No gimmicks, just science.
          </p>

          {/* Visual Learning Curve */}
          <div className="mx-auto mb-12 max-w-2xl">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Your Learning Curve
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Traditional studying
                  </span>
                  <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
                    <div className="h-2 w-1/4 rounded-full bg-red-400"></div>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    25% retained
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">With SlotWise</span>
                  <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
                    <div className="h-2 w-5/6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    85% retained
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="cursor-pointer bg-indigo-500 px-8 py-4 text-lg hover:bg-indigo-700"
              asChild
            >
              <SignUpButton />
            </Button>
            <Link
              href="https://github.com/Akshansh029/study-scheduler"
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black px-4 py-2 text-base font-medium text-gray-100 transition-colors hover:bg-gray-800"
            >
              Star us on GitHub
              <Github size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              How SlotWise Works
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Three simple steps backed by decades of cognitive science research
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Create & Organize
              </h3>
              <p className="leading-relaxed text-gray-600">
                Add your study materials as flashcards and organize them by
                subject. Our AI analyzes your content to optimize learning.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                <Repeat className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Smart Scheduling
              </h3>
              <p className="leading-relaxed text-gray-600">
                Our algorithm schedules reviews at the perfect moment—just
                before you forget. No cramming, just consistent progress.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Track Progress
              </h3>
              <p className="leading-relaxed text-gray-600">
                Watch your knowledge solidify with detailed analytics. See which
                topics need attention and celebrate your wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Science */}
      <section id="science" className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Built on Proven Science
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              SlotWise combines two powerful learning techniques that have been
              validated by decades of research
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
              <CardHeader className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-indigo-900">
                      Active Recall
                    </CardTitle>
                    <CardDescription className="text-indigo-700">
                      The Testing Effect
                    </CardDescription>
                  </div>
                </div>
                <p className="mb-4 text-lg leading-relaxed text-gray-700">
                  Instead of passively re-reading notes, active recall forces
                  your brain to retrieve information from memory. This
                  strengthens neural pathways and dramatically improves
                  retention.
                </p>
                <div className="rounded-lg bg-white/60 p-4">
                  <div className="flex items-center gap-2 font-semibold text-indigo-700">
                    <BarChart3 className="h-5 w-5" />
                    <span>80% better long-term retention</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
              <CardHeader className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-purple-900">
                      Spaced Repetition
                    </CardTitle>
                    <CardDescription className="text-purple-700">
                      The Spacing Effect
                    </CardDescription>
                  </div>
                </div>
                <p className="mb-4 text-lg leading-relaxed text-gray-700">
                  By reviewing information at increasing intervals, we combat
                  the forgetting curve. Each review session strengthens memory
                  and extends retention time.
                </p>
                <div className="rounded-lg bg-white/60 p-4">
                  <div className="flex items-center gap-2 font-semibold text-purple-700">
                    <Target className="h-5 w-5" />
                    <span>50% reduction in study time</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8 text-white">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 SlotWise. Built with science and care.</p>
        </div>
      </footer>
    </div>
  );
}
