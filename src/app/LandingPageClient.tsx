'use client';

import { useState, useEffect } from "react";
import {
  Mic, Sparkles, FileText, Zap, Shield, Users,
  ArrowRight, Check, Menu, X,
} from "lucide-react";
import Link from "next/link";

function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MeetScribe</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "Testimonials"].map((label) => {
              const id = label.toLowerCase().replace(/ /g, "-");
              return (
                <button key={id} onClick={() => scrollToSection(id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors relative group">
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
            <Link href="/onboarding" className="relative group overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25">
              <span className="relative z-10">Get started free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4 space-y-3">
            {["features", "how-it-works", "pricing", "testimonials"].map((id) => (
              <button key={id} onClick={() => scrollToSection(id)} className="block w-full text-left text-gray-400 hover:text-white py-2 capitalize">{id.replace("-", " ")}</button>
            ))}
            <Link href="/onboarding" className="block w-full text-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white">Get started free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [email, setEmail] = useState("");
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Meeting Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Turn sales meetings into <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">closed deals</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            MeetScribe automatically transcribes, summarizes, and extracts action items from your sales calls. Stop taking notes, start closing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-medium text-white transition-all hover:shadow-xl hover:shadow-indigo-500/25">
              <span className="relative z-10 flex items-center gap-2">
                Get started free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl border border-white/10 px-8 py-4 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all">
              See how it works
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Mic, title: "AI Transcription", desc: "Real-time speech-to-text with 95%+ accuracy. Supports multiple speakers and languages." },
    { icon: FileText, title: "Smart Summaries", desc: "Automatically generated meeting summaries with key points, decisions, and next steps." },
    { icon: Zap, title: "Action Items", desc: "AI extracts tasks and deadlines, assigns owners, and syncs to your CRM." },
    { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant, end-to-end encryption, and GDPR-ready data handling." },
    { icon: Users, title: "Team Collaboration", desc: "Share notes, comment on highlights, and keep everyone aligned." },
    { icon: Sparkles, title: "CRM Integration", desc: "Native integrations with Salesforce, HubSpot, and Pipedrive." },
  ];

  return (
    <section id="features" className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to win more deals</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">From transcription to CRM sync, MeetScribe handles the busywork so you can focus on selling.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Connect your calendar", desc: "Sync with Google Calendar or Outlook. MeetScribe joins your meetings automatically." },
    { num: "02", title: "AI takes notes", desc: "Real-time transcription, speaker identification, and smart summarization." },
    { num: "03", title: "Close more deals", desc: "Action items sync to your CRM. Follow-ups are automated. You focus on selling." },
  ];

  return (
    <section id="how-it-works" className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Three simple steps to transform your sales meetings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-bold text-white/5 mb-4">{step.num}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    { name: "Free", price: "$0", period: "forever", features: ["5 meetings/month", "Basic transcription", "Email summaries", "7-day storage"], cta: "Get started", href: "/onboarding", highlighted: false },
    { name: "Pro", price: "$29", period: "per user/month", features: ["Unlimited meetings", "Advanced AI summaries", "CRM integration", "Action item extraction", "Unlimited storage", "Priority support"], cta: "Start free trial", href: "/onboarding", highlighted: true },
    { name: "Team", price: "$99", period: "per user/month", features: ["Everything in Pro", "Team analytics", "Custom AI training", "SSO & SAML", "Dedicated account manager", "SLA guarantee"], cta: "Contact sales", href: "/onboarding", highlighted: false },
  ];

  return (
    <section id="pricing" className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Start free, upgrade when you need more power.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-6 rounded-2xl border transition-all duration-300 ${plan.highlighted ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-xs font-medium text-white">Most Popular</div>}
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`block w-full text-center py-2.5 rounded-xl font-medium transition-all ${plan.highlighted ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: "MeetScribe cut our follow-up time by 80%. Our reps actually use the CRM now because the data is already there.", author: "Sarah Chen", role: "VP of Sales, TechFlow", avatar: "SC" },
    { quote: "The AI summaries are scary good. I can review a 60-minute meeting in 2 minutes and know exactly what to do next.", author: "Marcus Johnson", role: "Enterprise AE, CloudNine", avatar: "MJ" },
    { quote: "We evaluated 5 tools. MeetScribe had the best transcription accuracy and the simplest setup. Live in a day.", author: "Priya Patel", role: "Sales Ops, Vertex", avatar: "PP" },
  ];

  return (
    <section id="testimonials" className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved by sales teams</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Join hundreds of teams already closing more deals with MeetScribe.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-gray-300 mb-6 leading-relaxed">\"{t.quote}\"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-medium\">{t.avatar}</div>
                <div>
                  <div className="text-white font-medium text-sm\">{t.author}</div>
                  <div className="text-gray-500 text-xs\">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-semibold\">MeetScribe</span>
          </div>
          <p className="text-gray-500 text-sm\">© 2026 MeetScribe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPageClient() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <GradientBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
