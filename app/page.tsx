import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GitBranch,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: GitBranch,
    title: "One graph for everything",
    body: "Classes, internships, research, and projects all connect to you, so you can see how your path fits together.",
  },
  {
    icon: Sparkles,
    title: "Next steps, suggested for you",
    body: "Get a branching tree of future classes and experiences, each with the skills it adds and the reason it was picked.",
  },
  {
    icon: TrendingUp,
    title: "See what a path is worth",
    body: "Each suggestion shows how much closer it gets you to the job you want, and how fast that salary pays back what you've spent on school.",
  },
]

const steps = [
  { title: "Map where you are", body: "Add your major, GPA, classes, and experiences. A sample path is ready to edit." },
  { title: "Set your goal", body: "Choose a target role, industry, and salary, and add what school has cost so far." },
  { title: "Generate your path", body: "One click grows your graph with suggestions ranked by how close they get you." },
]

function PrimaryCta({ signedIn }: { signedIn: boolean }) {
  const className =
    "group inline-flex h-11 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 shadow-[0_0_40px_-8px] shadow-emerald-400/70 transition hover:bg-emerald-300"
  const content = (
    <>
      {signedIn ? "Open your graph" : "Start mapping free"}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </>
  )

  if (signedIn) {
    return (
      <Link className={className} href="/graph">
        {content}
      </Link>
    )
  }

  return (
    <SignUpButton mode="modal">
      <button className={className} type="button">
        {content}
      </button>
    </SignUpButton>
  )
}

function GraphPreview() {
  return (
    <div className="relative mx-auto mt-20 w-full max-w-5xl">
      <div className="absolute -inset-x-10 -inset-y-6 rounded-[3rem] bg-emerald-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-xs text-white/40">nytinol / your graph</span>
        </div>

        <div className="landing-dots flex h-[420px] items-stretch px-4 py-6 text-left sm:h-[460px] sm:px-6">
          <div className="hidden w-44 shrink-0 flex-col justify-around md:flex lg:w-48">
            <PreviewNode icon={BookOpen} label="Class" title="CMSC 341" meta="Data Structures" />
            <PreviewNode icon={BriefcaseBusiness} label="Research" title="Security Lab RA" meta="8 hrs/week" />
            <PreviewNode icon={BriefcaseBusiness} label="Internship" title="SWE Intern" meta="Summer 2026" />
            <PreviewNode icon={BookOpen} label="Class" title="CMSC 411" meta="Computer Architecture" />
          </div>
          <Connectors className="hidden md:block" count={4} direction="in" />

          <div className="flex shrink-0 items-center">
            <div className="landing-float w-48 rounded-2xl border border-emerald-400/30 bg-neutral-900/95 p-4 shadow-[0_0_60px_-12px] shadow-emerald-400/50 sm:w-56">
              <p className="text-[10px] font-medium tracking-[0.16em] text-white/40 uppercase">You</p>
              <p className="mt-1 font-semibold">Computer Science · 3.6</p>
              <div className="mt-3 rounded-xl bg-white/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.16em] text-emerald-300/80 uppercase">
                  <Target className="size-3" /> Goal
                </p>
                <p className="mt-1 text-sm font-medium">Solution Architect</p>
                <p className="text-xs text-white/50">$120,000 / year</p>
              </div>
            </div>
          </div>

          <Connectors count={3} direction="out" />
          <div className="flex w-40 shrink-0 flex-col justify-around sm:w-52">
            <SuggestionNode title="Cloud Infrastructure Intern" meta="82% closer to goal" />
            <SuggestionNode title="CMSC 421 Operating Systems" meta="64% closer to goal" />
            <SuggestionNode title="AWS Solutions Associate" meta="71% closer to goal" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Connectors({
  className = "",
  count,
  direction,
}: {
  className?: string
  count: number
  direction: "in" | "out"
}) {
  const ends = Array.from({ length: count }, (_, index) => ((2 * index + 1) / (2 * count)) * 100)
  const suggested = direction === "out"

  return (
    <svg
      aria-hidden="true"
      className={`h-full min-w-6 flex-1 overflow-visible ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <g
        className={suggested ? "landing-flow" : undefined}
        fill="none"
        stroke={suggested ? "oklch(0.845 0.143 164.978 / 0.8)" : "oklch(0.696 0.17 162.48 / 0.55)"}
        strokeDasharray={suggested ? "6 8" : undefined}
        strokeWidth="1.5"
      >
        {ends.map((y) => (
          <path
            d={suggested ? `M0 50 C 50 50, 50 ${y}, 100 ${y}` : `M0 ${y} C 50 ${y}, 50 50, 100 50`}
            key={y}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  )
}

function PreviewNode({
  icon: Icon,
  label,
  title,
  meta,
}: {
  icon: typeof BookOpen
  label: string
  title: string
  meta: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/90 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 uppercase">
        <Icon className="size-3" /> {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{title}</p>
      <p className="truncate text-xs text-white/45">{meta}</p>
    </div>
  )
}

function SuggestionNode({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-400/[0.06] p-3 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300/90 uppercase">
        <Sparkles className="size-3" /> Suggested
      </p>
      <p className="mt-1 truncate text-sm font-medium">{title}</p>
      <p className="truncate text-xs text-white/50">{meta}</p>
    </div>
  )
}

export default async function Home() {
  const { userId } = await auth()
  const signedIn = Boolean(userId)

  return (
    <div className="relative min-h-svh overflow-hidden bg-neutral-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="landing-grid absolute inset-0" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link className="flex items-center gap-2.5" href="/">
          <img alt="" className="size-8 rounded-lg object-contain" src="/favicon.ico" />
          <span className="text-lg font-semibold tracking-tight">Nytinol</span>
        </Link>
        <nav className="flex items-center gap-2">
          <a className="hidden rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white sm:block" href="#features">
            Features
          </a>
          <a className="hidden rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white sm:block" href="#how-it-works">
            How it works
          </a>
          {signedIn ? (
            <Link className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/10" href="/graph">
              Dashboard
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/10" type="button">
                Sign in
              </button>
            </SignInButton>
          )}
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-16 text-center sm:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Built at hackUMBC 2026
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-7xl">
            Your path,{" "}
            <span className="bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              connected.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-white/60">
            Nytinol maps your classes, experiences, and career goal into one living graph, then shows you the next
            steps that get you there, along with what each one is worth.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta signedIn={signedIn} />
            <a
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>

          <GraphPreview />
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-32" id="features">
          <p className="text-sm font-medium text-emerald-300">Features</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop guessing what to do next semester.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                key={title}
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-32" id="how-it-works">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-300">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From transcript to trajectory in three steps.</h2>
              <ol className="mt-10 space-y-8">
                {steps.map((step, index) => (
                  <li className="flex gap-5" key={step.title}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-sm text-white/70">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-white/[0.02] to-transparent p-8 sm:p-10">
              <p className="text-xs font-medium tracking-[0.16em] text-white/40 uppercase">Suggested next step</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Cloud Infrastructure Intern</p>
              <p className="mt-2 text-sm text-white/55">A step toward Solution Architect, not the whole career.</p>
              <p className="mt-8 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-6xl font-semibold tracking-tight text-transparent sm:text-7xl">
                82%
              </p>
              <p className="mt-3 text-sm text-white/55">Closer to the goal than your current path</p>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-sm">
                <div>
                  <p className="text-white/40">If you land the goal</p>
                  <p className="mt-1 font-semibold">$120k / year</p>
                </div>
                <div>
                  <p className="text-white/40">School so far</p>
                  <p className="mt-1 font-semibold">$200k</p>
                </div>
                <div>
                  <p className="text-white/40">Tuition payback</p>
                  <p className="mt-1 font-semibold">~2 years</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-32">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 px-8 py-16 text-center sm:px-16">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.696_0.17_162.48/0.25),transparent_70%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                Make every semester count.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/60">
                Build your graph in minutes and see where your degree can actually take you.
              </p>
              <div className="mt-8 flex justify-center">
                <PrimaryCta signedIn={signedIn} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-white/40 sm:flex-row">
          <p>© 2026 Nytinol</p>
          <a className="transition hover:text-white" href="https://hackumbc-2026.devpost.com/" rel="noreferrer" target="_blank">
            hackUMBC 2026
          </a>
        </div>
      </footer>
    </div>
  )
}
