"use client";

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
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Turn meetings into</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">actionable insights</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MeetScribe automatically transcribes, summarizes, and extracts action items from your sales calls.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-12">
            <input type="email" placeholder="Your work email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
            <Link href={`/onboarding?email=${encodeURIComponent(email)}`}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/25 whitespace-nowrap">
              <span className="relative z-10 flex items-center justify-center gap-2">Start for free <ArrowRight className="w-4 h-4" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-8">No credit card required. Free plan includes 5 meetings/month.</p>
          <div className="flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["Salesforce", "HubSpot", "Slack", "Notion", "Zapier"].map((company) => (
              <span key={company} className="text-sm font-semibold text-gray-400">{company}</span>
            ))}
          </div>
        </div>
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
          <div className="relative rounded-2xl border border-white/10 bg-[#111118] p-2 shadow-2xl shadow-indigo-500/10">
            <div className="rounded-xl bg-[#0d0d12] border border-white/5 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-gray-600">MeetScribe Dashboard</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="h-24 rounded-lg bg-white/5 border border-white/5" />
                  <div className="h-24 rounded-lg bg-white/5 border border-white/5" />
                  <div className="h-24 rounded-lg bg-white/5 border border-white/5" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/3 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"><Mic className="w-4 h-4 text-indigo-400" /></div>
                      <div className="flex-1"><div className="h-3 w-32 bg-white/10 rounded mb-2" /><div className="h-2 w-20 bg-white/5 rounded" /></div>
                      <div className="h-6 w-16 bg-green-500/20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <Mic className="w-6 h-6" />, title: "AI Transcription", description: "Real-time speech-to-text with 95%+ accuracy. Supports multiple speakers and languages.", gradient: "from-blue-500 to-cyan-500" },
    { icon: <Sparkles className="w-6 h-6" />, title: "Smart Summaries", description: "Get concise meeting summaries with key points, decisions, and context-aware insights.", gradient: "from-indigo-500 to-purple-500" },
    { icon: <Zap className="w-6 h-6" />, title: "Action Items", description: "Automatically extract tasks, assign owners, and set deadlines. Sync to your CRM instantly.", gradient: "from-purple-500 to-pink-500" },
    { icon: <FileText className="w-6 h-6" />, title: "Export Anywhere", description: "Export to PDF, Word, or copy to clipboard. Share via Slack, email, or your CRM.", gradient: "from-pink-500 to-rose-500" },
    { icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", description: "SOC 2 compliant, end-to-end encryption, and granular access controls for your data.", gradient: "from-emerald-500 to-teal-500" },
    { icon: <Users className="w-6 h-6" />, title: "Team Collaboration", description: "Shared libraries, comments, and team-wide meeting insights. Built for sales teams.", gradient: "from-orange-500 to-amber-500" },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Everything you need to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">close more deals</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Powerful AI tools designed specifically for sales teams to capture, analyze, and act on every meeting.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-300 hover:border-white/20">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}>
                <div className="w-full h-full rounded-[10px] bg-[#0d0d12] flex items-center justify-center text-white">{feature.icon}</div>
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
    { number: "01", title: "Connect your calendar", description: "Sync with Google Calendar or Outlook. MeetScribe automatically joins your scheduled meetings." },
    { number: "02", title: "AI takes notes", description: "Our AI listens, transcribes, and identifies key moments, decisions, and action items in real-time." },
    { number: "03", title: "Review & act", description: "Get instant summaries, export to your CRM, and follow up with prospects while the meeting is fresh." },
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">How it <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">works</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">From meeting to action in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300 h-full">
                <span className="text-5xl font-bold bg-gradient-to-r from-indigo-500/30 to-purple-500/30 bg-clip-text text-transparent">{step.number}</span>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"><ArrowRight className="w-6 h-6 text-gray-600" /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    { name: "Free", price: "$0", period: "/month", description: "Perfect for trying out MeetScribe", features: ["5 meetings per month", "Basic AI summaries", "Action items extraction", "7-day history", "Email support"], cta: "Get started free", href: "/onboarding", popular: false },
    { name: "Pro", price: "$15", period: "/month", description: "For sales professionals who close deals", features: ["Unlimited meetings", "Advanced AI summaries", "CRM integrations (HubSpot, Salesforce)", "Priority AI processing", "Unlimited history", "Team collaboration", "Export to PDF & Word", "Priority support"], cta: "Start Pro trial", popular: true },
    { name: "Enterprise", price: "Custom", period: "", description: "For teams that need more power", features: ["Everything in Pro", "SSO & SAML", "Custom AI training", "Dedicated account manager", "SLA guarantee", "On-premise deployment", "Advanced analytics"], cta: "Contact sales", popular: false },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Simple, transparent <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">pricing</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Start free, upgrade when you need more power. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-2xl p-8 transition-all duration-300 ${plan.popular ? "border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent" : "border border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white">Most Popular</span></div>}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{plan.price}</span><span className="text-gray-500">{plan.period}</span></div>
                <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />{feature}</li>
                ))}
              </ul>
              <Link href={plan.href || "/login"} className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all ${plan.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"}`}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { content: "MeetScribe transformed our sales process. We went from scattered notes to structured action items in every meeting. Our close rate increased by 30%.", author: "Sarah Chen", role: "VP of Sales", company: "TechFlow", avatar: "SC" },
    { content: "The AI summaries are incredibly accurate. It catches details I would have missed and automatically creates tasks in HubSpot. Game changer for our team.", author: "Marcus Johnson", role: "Sales Director", company: "CloudSync", avatar: "MJ" },
    { content: "We evaluated 5 different tools and MeetScribe was the only one that actually understood sales context. The CRM integration is seamless.", author: "Emily Rodriguez", role: "Account Executive", company: "DataPulse", avatar: "ER" },
    { content: "The free tier is generous enough to test thoroughly. Upgrading to Pro was a no-brainer once we saw the ROI on time saved per meeting.", author: "David Kim", role: "Founder", company: "StartupXYZ", avatar: "DK" },
    { content: "Finally, a tool that doesn't just transcribe but actually understands what matters in a sales call. The follow-up email drafts alone save me 30 minutes per meeting.", author: "Lisa Thompson", role: "Senior AE", company: "SalesForce Pro", avatar: "LT" },
    { content: "Our team of 12 AEs uses MeetScribe daily. The shared library means no more 'what did the client say?' questions. Everyone stays aligned.", author: "James Wilson", role: "Sales Manager", company: "GrowthLabs", avatar: "JW" },
  ];

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Don't just take our word for <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">it</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Join thousands of sales professionals who've transformed their meeting workflow.</p>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-all duration-300">
              <p className="text-gray-300 text-sm leading-relaxed mb-6">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">{testimonial.avatar}</div>
                <div>
                  <div className="text-white text-sm font-medium">{testimonial.author}</div>
                  <div className="text-gray-500 text-xs">{testimonial.role} at {testimonial.company}</div>
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
  const links = { Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"], Resources: ["Documentation", "API Reference", "Blog", "Community", "Support"], Company: ["About", "Careers", "Contact", "Press Kit", "Partners"], Legal: ["Privacy", "Terms", "Security", "GDPR", "SOC 2"] };

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Mic className="w-4 h-4 text-white" /></div>
              <span className="text-xl font-bold text-white">MeetScribe</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs mb-4">AI-powered meeting notes for sales teams. Turn every conversation into a closed deal.</p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "GitHub", "Discord"].map((social) => (
                <button key={social} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all text-xs">{social[0]}</button>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}><button className="text-gray-500 hover:text-white text-sm transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 MeetScribe, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-gray-600 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden relative">
      <GradientBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <Footer />
      </div>
    </div>
  );
}
