import Link from "next/link";
import {
  Sparkles,
  Wind,
  Zap,
  Layers,
  ArrowRight,
  Github,
  ChevronRight,
  MousePointer2,
  BookOpen,
  Library,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-amber-100 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-amber-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-amber-200">
              G
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Grains AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#features"
              className="hover:text-amber-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-amber-600 transition-colors"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2 hover:bg-slate-50 rounded-full transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Start Your Harvest
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-50/50 blur-[120px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-6 animate-bounce shadow-sm border border-amber-200">
                <Sparkles size={14} />
                <span>AI-Powered Knowledge Harvesting</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Don't just bookmark. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                  Cultivate Knowledge.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Grains AI is your digital garden. Capture pages, track your
                reading progress, and let AI automatically organize and
                summarize your findings into actionable insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-amber-200 flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-slate-400">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-slate-900 font-bold text-xl tracking-tighter">
                    Gemini 2.5
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Intelligence
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-slate-900 font-bold text-xl tracking-tighter">
                    Real-time
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Sync
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-slate-900 font-bold text-xl tracking-tighter">
                    0%
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Digital Waste
                  </span>
                </div>
              </div>
            </div>

            {/* Illustration Area */}
            <div className="relative">
              <div className="relative z-10 animate-float">
                {/* Mockup / Abstract Visual */}
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-amber-100 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] bg-amber-50 rounded-2xl overflow-hidden relative">
                    {/* Abstract "Grains" grid */}
                    <div className="absolute inset-0 p-6 grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`rounded-xl border border-amber-200 p-3 flex flex-col justify-between ${i === 1 ? "bg-white shadow-md" : "bg-white/40"}`}
                        >
                          <div
                            className={`w-8 h-2 rounded-full mb-2 ${i === 1 ? "bg-amber-400" : "bg-slate-200"}`}
                          />
                          <div className="space-y-1">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
                            <div className="w-2/3 h-1.5 bg-slate-100 rounded-full" />
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${i === 1 ? "w-3/4 bg-amber-500" : "w-1/4 bg-slate-300"}`}
                              />
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">
                              {i === 1 ? "75%" : "25%"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Sparkles size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-200/40 rounded-full blur-3xl -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100/60 rounded-full blur-3xl -z-20" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#FDFCFB] to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4">
                Core Ecosystem
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                Designed for Deep Learning
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                We've built a cycle of knowledge that turns passive consumption
                into active mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group p-8 bg-slate-800/50 rounded-3xl border border-slate-700 hover:border-amber-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <MousePointer2 size={28} />
                </div>
                <h4 className="text-2xl font-bold mb-4">Precise Capture</h4>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Our Chrome extension doesn't just save links. It tracks
                  exactly where you stopped reading, allowing you to "Jump Back
                  In" instantly.
                </p>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Card 2 */}
              <div className="group p-8 bg-slate-800/50 rounded-3xl border border-slate-700 hover:border-amber-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h4 className="text-2xl font-bold mb-4">AI Categorization</h4>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Manual tagging is dead. Gemini AI analyzes every grain and
                  sorts it into the perfect category before you even finish your
                  coffee.
                </p>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Card 3 */}
              <div className="group p-8 bg-slate-800/50 rounded-3xl border border-slate-700 hover:border-amber-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Wind size={28} />
                </div>
                <h4 className="text-2xl font-bold mb-4">Deep Harvest</h4>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Need a refresher? Generate comprehensive summaries on demand.
                  Transform hours of reading into minutes of high-impact review.
                </p>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works / Content Section */}
        <section id="how-it-works" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-12">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-600 shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">
                        Install the Collector
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        Add our lightweight Chrome extension to your browser. It
                        stays out of your way until you need it.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-600 shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">
                        Save with One Click
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        Found something interesting? Click 'Save' and Grains AI
                        will snapshot the page and your current progress.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-600 shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Review & Grow</h4>
                      <p className="text-slate-600 leading-relaxed">
                        Visit your dashboard to see your categorized library.
                        Use AI summaries to solidify your learning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 relative">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200/50 rounded-full blur-2xl" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-full bg-white rounded-2xl shadow-xl p-6 border border-slate-100 mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
                          <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
                        </div>
                      </div>
                      <div className="h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-200">
                        <Sparkles className="text-amber-400 mb-2" size={24} />
                        <span className="text-xs font-bold text-slate-400">
                          Summarizing...
                        </span>
                      </div>
                    </div>
                    <h4 className="text-2xl font-bold text-center mb-4">
                      Knowledge at your fingertips
                    </h4>
                    <p className="text-slate-500 text-center text-sm">
                      Our interface is designed to reduce cognitive load and
                      focus on what matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 relative">
          <div className="max-w-4xl mx-auto bg-amber-500 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-amber-200">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 gap-4 -rotate-12 translate-y-12">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white" />
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                Ready to stop bookmarking <br className="hidden md:block" /> and
                start growing?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-amber-600 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all shadow-xl"
                >
                  Get Started Now
                </Link>
                <a
                  href="https://github.com/sweet-nothing02/grains-ai"
                  target="_blank"
                  className="w-full sm:w-auto px-10 py-5 bg-amber-600 text-white rounded-2xl font-bold text-xl hover:bg-amber-700 transition-all border border-amber-400/50 flex items-center justify-center gap-2"
                >
                  <Github size={20} />
                  View Source
                </a>
              </div>
              <p className="mt-8 text-amber-100 text-sm font-medium">
                Join 2,000+ readers cultivating their knowledge with Grains AI.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-white text-[10px] font-bold">
              G
            </div>
            <span className="font-bold text-slate-800 tracking-tight">
              Grains AI
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-amber-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Twitter
            </a>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 Grains AI. Built for the curious.
          </div>
        </div>
      </footer>
    </div>
  );
}
