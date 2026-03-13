"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle,
  ChevronRight,
  Globe,
  GraduationCap,
  Hand,
  Heart,
  HeartHandshake,
  Leaf,
  Moon,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AnimatedSection from "../components/AnimatedSection";

/* ================================================================== */
/*  WAVE DIVIDER                                                      */
/* ================================================================== */

function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-zero ${className}`}>
      <svg
        className="relative block w-full h-[40px] md:h-[60px]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C69.74,23.3,137.66,51.81,209.5,70.67,247.16,80.57,285.4,85.1,321.39,56.44Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  LANDING PAGE                                                      */
/* ================================================================== */

export default function LandingPage() {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "20%"]);

  return (
    <div className="relative min-h-screen bg-neutral-50 overflow-hidden">
      <Navbar />

      {/* Background Parallax Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-[800px] left-[-10%] h-[600px] w-[60%] rounded-full bg-teal-100/40 mix-blend-multiply blur-[120px]" />
        <div className="absolute top-[1600px] right-[-10%] h-[500px] w-[50%] rounded-full bg-primary-100/40 mix-blend-multiply blur-[120px]" />
      </motion.div>

      <div className="relative z-10 bg-transparent">
        <HeroSection />
        <WaveDivider className="text-neutral-50 bg-primary-900 -mt-[1px]" />

        <CommunityImpact />

        <WaveDivider className="text-white bg-neutral-50" />
        <HowItWorks />

        <WaveDivider className="text-neutral-50 bg-white -mt-[1px]" />
        <CategoriesGrid />

        <Testimonials />

        <ZakaatSection />

        <TrustSection />

        <Footer />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. HERO SECTION — Kashmir Background                              */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <AnimatedSection className="relative overflow-hidden pb-12">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kashmir/hero-kashmir.jpg"
          alt="Kashmir Valley"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-emerald-900/75" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="section-container relative z-10 flex min-h-[85vh] flex-col items-center justify-center gap-12 py-20 text-center lg:flex-row lg:text-left">
        {/* Left — copy */}
        <div className="flex-1">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by hundreds of donors across Kashmir
          </span>

          <AnimatedSection as="h1" delay={0.2} className="mt-4 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Support Your Community.
            <br />
            <span className="text-emerald-300">Give with Trust.</span>
          </AnimatedSection>

          <AnimatedSection as="p" delay={0.3} className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            A transparent platform connecting donors with verified causes
            across Kashmir. Support education, healthcare, and community
            welfare through secure and trusted donations.
          </AnimatedSection>

          <AnimatedSection delay={0.4} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/explore"
              className="shine-effect inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:scale-[1.03] hover:shadow-xl"
            >
              Explore Campaigns
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Start a Campaign
              <ChevronRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>

          {/* Zakaat/Sadaqah line */}
          <AnimatedSection delay={0.5} className="mt-5">
            <p className="flex items-center justify-center gap-1.5 text-xs text-white/50 lg:justify-start">
              <Moon className="h-3 w-3" />
              Zakaat and Sadaqah contributions supported.
            </p>
          </AnimatedSection>
        </div>

        {/* Right — abstract illustration */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="relative">
            <div className="flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-lg xl:h-80 xl:w-80">
              <HeartHandshake className="h-24 w-24 text-white/25" strokeWidth={1} />
            </div>
            <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7 text-emerald-200" />
            </div>
            <div className="absolute -bottom-2 -left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Globe className="h-6 w-6 text-emerald-200" />
            </div>
            <div className="absolute -right-8 bottom-12 flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/20 backdrop-blur-sm">
              <Moon className="h-5 w-5 text-teal-200" />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  2. COMMUNITY IMPACT                                               */
/* ------------------------------------------------------------------ */

const IMPACT_CARDS = [
  {
    icon: GraduationCap,
    title: "Education Support",
    description:
      "Fund schools, scholarships, and educational programs for underprivileged children across Kashmiri communities.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Stethoscope,
    title: "Healthcare Assistance",
    description:
      "Support medical camps, hospital funding, and healthcare access for remote areas in the Kashmir valley.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Users,
    title: "Community Welfare",
    description:
      "Empower communities through livelihood programs, orphan care, and disaster relief across the region.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

function CommunityImpact() {
  return (
    <AnimatedSection className="py-20">
      <div className="section-container">
        <div className="mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
            Our Mission
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Supporting Communities Across Kashmir
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            Your generosity empowers real change in education, healthcare,
            and community welfare.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT_CARDS.map((item) => (
            <div
              key={item.title}
              className="card group flex flex-col items-start gap-4 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} transition group-hover:scale-110`}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  3. HOW IT WORKS                                                   */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    step: "01",
    icon: BookOpen,
    title: "Create Campaign",
    description:
      "Share your cause, set a goal, and tell the world why it matters.",
  },
  {
    step: "02",
    icon: Shield,
    title: "Get Verified",
    description:
      "Our team reviews your campaign to ensure trust and authenticity.",
  },
  {
    step: "03",
    icon: Heart,
    title: "Receive Donations",
    description:
      "Start collecting donations from generous supporters across Kashmir.",
  },
];

function HowItWorks() {
  return (
    <AnimatedSection id="how-it-works" className="bg-white py-20">
      <div className="section-container">
        <div className="mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            Three simple steps to turn compassion into real-world impact.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="group text-center">
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 transition group-hover:bg-primary-100 group-hover:scale-110">
                <item.icon className="h-7 w-7 text-primary-600" />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-lg shadow-primary-600/30">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  4. CATEGORIES GRID                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { name: "Education", icon: GraduationCap, bg: "bg-blue-50", textColor: "text-blue-600" },
  { name: "Healthcare", icon: Heart, bg: "bg-rose-50", textColor: "text-rose-600" },
  { name: "Women Empowerment", icon: Users, bg: "bg-purple-50", textColor: "text-purple-600" },
  { name: "Environment", icon: Leaf, bg: "bg-emerald-50", textColor: "text-emerald-600" },
  { name: "Rural Development", icon: Globe, bg: "bg-amber-50", textColor: "text-amber-600" },
  { name: "Zakaat", icon: Moon, bg: "bg-teal-50", textColor: "text-teal-600" },
];

function CategoriesGrid() {
  return (
    <AnimatedSection className="py-20">
      <div className="section-container">
        <div className="mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
            Make an Impact
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Explore Categories
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            Choose a cause close to your heart and start creating change today.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href="/explore"
              className="card group flex items-center gap-4 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cat.bg} transition group-hover:scale-110`}
              >
                <cat.icon className={`h-5 w-5 ${cat.textColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Explore campaigns →
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-primary-500" />
            </Link>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  5. TESTIMONIALS                                                   */
/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    name: "Ayesha Siddiqui",
    role: "Donor",
    avatar: "AS",
    color: "bg-emerald-100 text-emerald-700",
    stars: 5,
    quote:
      "DonateNow made it so easy to support causes in Kashmir. I can see exactly where my Zakaat goes, and the transparency gives me full confidence.",
  },
  {
    name: "Muhammad Faisal",
    role: "NGO Director",
    avatar: "MF",
    color: "bg-indigo-100 text-indigo-700",
    stars: 5,
    quote:
      "We raised our entire target in 3 weeks. The platform connected us with hundreds of donors we would have never reached across the valley.",
  },
  {
    name: "Fatima Khan",
    role: "Donor",
    avatar: "FK",
    color: "bg-amber-100 text-amber-700",
    stars: 5,
    quote:
      "I use DonateNow for my Zakaat every year. The calculator is accurate and the donation process feels secure and dignified.",
  },
];

function Testimonials() {
  return (
    <AnimatedSection className="bg-neutral-50 py-20">
      <div className="section-container">
        <div className="mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
            Community Voices
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Trusted by Hundreds of Donors
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            Real stories from real people making a difference every day.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <AnimatedSection
              key={t.name}
              as="div"
              className="group flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-neutral-600 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${t.color}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-neutral-400">{t.role}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  6. ZAKAAT + SADAQAH SECTION                                       */
/* ------------------------------------------------------------------ */

function ZakaatSection() {
  return (
    <AnimatedSection className="bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <div className="section-container py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
          {/* Icon */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25">
            <Moon className="h-9 w-9 text-white" />
          </div>

          {/* Copy */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Fulfill Your Zakaat with Transparency
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-600">
              Donate your Zakaat with confidence. Verified campaigns ensure
              that your contributions reach those who truly need them.
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              Zakaat calculations follow the standard 2.5% rule.
            </p>
            <Link
              href="/zakaat"
              className="btn-primary shine-effect mt-6 inline-flex shadow-teal-600/25"
            >
              <Calculator className="h-4 w-4" />
              Calculate Zakaat
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  7. TRUST SECTION                                                  */
/* ------------------------------------------------------------------ */

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: "Verified NGOs",
    description:
      "Every NGO is document-verified before they can create campaigns on the platform.",
    color: "text-primary-600",
    bg: "bg-primary-50",
  },
  {
    icon: TrendingUp,
    title: "Transparent Donations",
    description:
      "Track exactly where your money goes with real-time progress updates on every campaign.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: HeartHandshake,
    title: "Community Focused",
    description:
      "Built specifically for the Kashmiri community — supporting causes that matter most to you.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

function TrustSection() {
  return (
    <AnimatedSection className="bg-white py-20">
      <div className="section-container">
        <div className="mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
            Why DonateNow
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Built for Community Trust
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            A platform designed with transparency, security, and community values at its core.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_FEATURES.map((item) => (
            <div
              key={item.title}
              className="card group flex flex-col items-center gap-4 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} transition group-hover:scale-110`}
              >
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  8. FOOTER                                                         */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="section-container py-12">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm text-white">
                💚
              </span>
              <span className="text-lg font-bold text-neutral-900">
                DonateNow
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-neutral-500">
              Dedicated to supporting humanitarian causes and community
              welfare across Kashmir.
            </p>
            <p className="mt-1 text-xs text-neutral-400 italic">
              Empowering generosity through technology.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <Link
              href="/explore"
              className="text-neutral-500 transition hover:text-primary-600"
            >
              Explore
            </Link>
            <Link
              href="/zakaat"
              className="text-neutral-500 transition hover:text-primary-600"
            >
              Zakaat
            </Link>
            <Link
              href="/login"
              className="text-neutral-500 transition hover:text-primary-600"
            >
              Login
            </Link>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { label: "Twitter", path: "M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1C6.53 9.42 3.72 7.5 1.85 4.84c-.42.72-.66 1.56-.66 2.45 0 1.67.85 3.14 2.14 4-.79-.03-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.61-.03-.91-.08.61 1.92 2.39 3.32 4.49 3.36-1.65 1.29-3.72 2.06-5.98 2.06-.39 0-.77-.02-1.15-.07 2.13 1.37 4.66 2.17 7.38 2.17 8.85 0 13.69-7.33 13.69-13.69 0-.21 0-.42-.01-.63.94-.68 1.76-1.53 2.4-2.5z" },
              { label: "GitHub", path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" },
              { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 transition hover:bg-primary-50 hover:text-primary-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} DonateNow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
