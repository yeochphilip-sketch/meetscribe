'use client';

import { useState, useEffect } from "react";
import {
  Mic, Sparkles, FileText, Zap, Shield, Users,
  ArrowRight, Check, Menu, X,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

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
            {isLoggedIn ? (
              <Link href="/dashboard" className="relative group overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
                <Link href="/onboarding" className="relative group overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 space-y-3">
            {["Features", "How it works", "Pricing", "Testimonials"].map((label) => {
              const id = label.toLowerCase().replace(/ /g, "-");
              return (
                <button key={id} onClick={() => scrollToSection(id)} className="block w-full text-left px-2 py-2 text-sm text-gray-400 hover:text-white">
                  {label}
                </button>
              );
            })}
            <div className="pt-3 border-t border-white/5 space-y-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="block w-full text-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block w-full text-center text-sm text-gray-300 hover:text-white py-2">Sign in</Link>
                  <Link href="/onboarding" className="block w-full text-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Meeting Assistant
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Transform Your <br />
              Meetings with <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI-Powered</span> Transcripts
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              Transcribe, summarize, and capture key insights from every meeting effortlessly and accurately.
            </p>
            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link href="/onboarding" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5">
                    Get Started for Free
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-white font-semibold hover:bg-white/5 transition-all">
                    See How It Works
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f1a] shadow-2xl shadow-indigo-500/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0a12]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-500">Meeting Transcript</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-300">JD</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-1"><span className="text-indigo-400 font-medium">John Doe</span> <span className="text-gray-600">10:02 AM</span></div>
                    <p className="text-sm text-gray-400">Hey Sarah, thanks for joining. Let&apos;s discuss the Q3 roadmap and priorities for the mobile app redesign.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium text-purple-300">SM</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-1"><span className="text-purple-400 font-medium">Sarah Miller</span> <span className="text-gray-600">10:03 AM</span></div>
                    <p className="text-sm text-gray-400">Sure, let&apos;s prioritize the mobile app. What&apos;s the timeline looking like?</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-300">JD</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-1"><span className="text-indigo-400 font-medium">John Doe</span> <span className="text-gray-600">10:04 AM</span></div>
                    <p className="text-sm text-gray-400">Can you prepare a pricing analysis? We need to present to the board next week.</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300">AI Summary</span>
                  </div>
                  <p className="text-sm text-gray-400">Discussed Q3 roadmap, prioritized mobile app redesign with mockups due Friday, and requested pricing analysis for next meeting.</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Mic,
    title: "Real-time Transcription",
    description: "Instantly convert speech to text with high accuracy across multiple speakers.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Users,
    title: "Speaker Identification",
    description: "Automatically detect and label different speakers in your meetings.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: FileText,
    title: "AI Meeting Minutes",
    description: "Generate concise meeting summaries and action items with a single click.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Smart Action Items",
    description: "Automatically extract and assign action items with deadlines.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and SOC 2 compliance for your meeting data.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Sparkles,
    title: "CRM Integration",
    description: "Sync meeting insights directly to Salesforce, HubSpot, and more.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to capture, understand, and share the valuable information from your meetings.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Paste Transcript", description: "Copy from Zoom, Google Meet, or Otter.ai and paste it in." },
    { number: "02", title: "AI Generates Notes", description: "Summary, action items, and follow-up email in seconds." },
    { number: "03", title: "Close More Deals", description: "Send follow-ups faster and never miss action items." },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Three simple steps to transform your sales meetings.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative group">
              <div className="text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out MeetScribe",
    features: ["5 meetings per month", "AI summary", "Action items", "Follow-up email", "No exports", "No CRM sync"],
    cta: "Get Started",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "per month",
    description: "For sales reps who close deals",
    features: ["Unlimited meetings", "Everything in Free", "Export to PDF/Word", "CRM integrations", "Priority AI speed"],
    cta: "Upgrade to Pro",
    href: "/plan",
    popular: true,
  },
];

function PricingSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Simple pricing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-8 ${plan.popular ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30' : 'bg-white/[0.02] border border-white/5'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-medium text-white">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={isLoggedIn && plan.name === "Pro" ? "/plan" : plan.href}
                className={`block w-full text-center py-3 rounded-xl font-medium transition-all ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
              >
                {isLoggedIn && plan.name === "Pro" ? "Upgrade Now" : plan.cta}
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
    { quote: "MeetScribe saves me 30 minutes per meeting. The action items are spot on.", author: "Alex Chen", role: "Sales Director", company: "TechCorp" },
    { quote: "Our team closed 40% more deals after using MeetScribe for follow-ups.", author: "Maria Garcia", role: "Account Executive", company: "CloudScale" },
    { quote: "The CRM integration is seamless. No more manual data entry.", author: "James Wilson", role: "VP Sales", company: "DataFlow" },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Loved by sales teams</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">See what our customers have to say.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-gray-300 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.author}</div>
                  <div className="text-xs text-gray-500">{t.role}, {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <section className="py-20 lg:py-32 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to never miss a meeting moment?</h2>
        <p className="text-gray-400 text-lg mb-8">Join sales reps who save 30 minutes per meeting.</p>
        {isLoggedIn ? (
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5">
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : (
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5">
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
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
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-400">MeetScribe</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
            <Link href="/onboarding" className="hover:text-gray-300 transition-colors">Get Started</Link>
          </div>
          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} MeetScribe. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPageClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
      <GradientBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
