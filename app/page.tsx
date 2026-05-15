"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function PromptForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [layout, setLayout] = useState<"mobile" | "web">("mobile");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please describe your app first");
      return;
    }
    setError("");
    const encodedPrompt = encodeURIComponent(prompt.trim());
    router.push(`/canvas?prompt=${encodedPrompt}&layout=${layout}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px] flex flex-col gap-4 mx-auto">
      <div className="flex flex-col gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Food delivery app for restaurants — menu, cart, checkout, order tracking"
          className="w-full p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          rows={3}
        />
        {error && <p className="text-red-500 text-sm text-left">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLayout("mobile")}
          className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
            layout === "mobile" 
              ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          📱 Mobile App
        </button>
        <button
          type="button"
          onClick={() => setLayout("web")}
          className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
            layout === "web" 
              ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          🖥 Web App
        </button>
      </div>

      <Button type="submit" size="lg" className="w-full bg-[var(--accent)] text-white hover:bg-indigo-600 h-12 text-lg font-medium">
        Generate App Flow &rarr;
      </Button>
    </form>
  );
}

function HeroSection() {
  return (
    <section className="w-full px-6 pt-32 pb-24 text-center flex flex-col items-center">
      <h1 className="text-4xl md:text-[64px] font-bold leading-tight max-w-4xl mb-6">
        Design your app. No Figma. No designer. Just describe it.
      </h1>
      <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-12">
        Type one sentence. Get 4–6 connected, polished app screens in seconds. Export as HTML. Free, always.
      </p>
      <PromptForm />
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🌊",
      title: "Full App Flow",
      desc: "Not just one screen. Get the complete user journey — Login, Dashboard, Settings and more — all visually consistent."
    },
    {
      icon: "✨",
      title: "AI Chat Editing",
      desc: "Select any screen. Type what to change. The AI updates only that screen without touching the others."
    },
    {
      icon: "💾",
      title: "HTML Export — Free Forever",
      desc: "Download every screen as a clean HTML file. Open in any browser. Share with developers. No subscription needed."
    }
  ];

  return (
    <section className="w-full max-w-6xl px-6 py-20 border-t border-[var(--border)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="glass p-8 rounded-xl flex flex-col items-start text-left">
            <span className="text-4xl mb-4">{f.icon}</span>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamplesSection() {
  const examples = [
    { name: "HR Leave Management SaaS", details: "5 screens · Web App" },
    { name: "Food Delivery App", details: "4 screens · Mobile App" },
    { name: "Freelancer Dashboard", details: "6 screens · Web App" },
  ];

  return (
    <section className="w-full max-w-6xl px-6 py-20 border-t border-[var(--border)] text-center">
      <h2 className="text-3xl font-bold mb-12">See what others have built</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {examples.map((ex, i) => (
          <div key={i} className="glass rounded-xl overflow-hidden text-left flex flex-col">
            <div className="h-48 w-full bg-[var(--border)] opacity-50 relative flex items-center justify-center">
              <span className="text-[var(--text-muted)] text-sm">Thumbnail Placeholder</span>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold mb-1">{ex.name}</h4>
              <p className="text-sm text-[var(--text-muted)]">{ex.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomCTASection() {
  return (
    <section className="w-full px-6 py-32 border-t border-[var(--border)] text-center flex flex-col items-center">
      <h2 className="text-3xl md:text-5xl font-bold mb-10">Start designing for free</h2>
      <PromptForm />
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Background grid */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      <HeroSection />
      <FeaturesSection />
      <ExamplesSection />
      <BottomCTASection />
    </div>
  );
}
