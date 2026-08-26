"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

const stages = [
  { title: "Student", action: "Plan your training pathway", detail: "Explore residency and early-career resources.", href: "/resources#residency", steps: ["Explore residency guidance", "Organize your timeline", "Learn about clinical pathways"] },
  { title: "Resident", action: "Prepare for your next transition", detail: "Turn training milestones into a clearer professional plan.", href: "/resources#residency", steps: ["Review career resources", "Build your profile", "Explore employers"] },
  { title: "Licensed professional", action: "Find opportunities that fit your next step", detail: "Search by specialty, state, setting, and support needs.", href: "/jobs", steps: ["Search healthcare jobs", "Compare organizations", "Complete your profile"] },
  { title: "Specialist", action: "Focus your search around your expertise", detail: "Explore specialist roles, employers, and career resources.", href: "/jobs", steps: ["Search by specialty", "Review workplace context", "Track applications"] },
  { title: "Leadership", action: "Move your healthcare career forward", detail: "Find organizations and roles aligned with your experience.", href: "/jobs", steps: ["Explore leadership roles", "Compare organizations", "Stay ready for opportunities"] },
] as const

export function CareerNavigator() {
  const [selectedStage, setSelectedStage] = useState(2)
  const stage = stages[selectedStage]

  return (
    <div className="rounded-[2rem] border border-white/80 bg-[#0e416c]/95 p-5 shadow-[0_28px_70px_rgba(15,76,129,0.32)] backdrop-blur-sm sm:p-6">
      <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.07] p-5 text-white backdrop-blur sm:p-6">
        <p className="text-sm font-medium text-white/70">Career Navigator</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">Where are you in your healthcare career?</h2>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0">
          {stages.map((item, index) => (
            <div className="relative" key={item.title}>
              <button className={index === selectedStage ? "relative z-10 w-full rounded-xl bg-teal-200 px-2 py-2 text-xs font-bold leading-4 text-slate-950 sm:rounded-full" : "relative z-10 w-full rounded-xl border border-white/15 bg-white/[0.06] px-2 py-2 text-xs font-semibold leading-4 text-white/75 transition hover:bg-white/[0.14] sm:rounded-full"} onClick={() => setSelectedStage(index)} type="button">{item.title}</button>
              {index < stages.length - 1 ? <span className="pointer-events-none absolute left-[calc(50%+1.15rem)] top-1/2 z-0 hidden h-px w-[calc(100%-2.3rem)] bg-teal-200/45 sm:block" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/12 bg-slate-950/20 p-5">
          <p className="text-xs font-bold tracking-[0.14em] text-teal-200 uppercase">{stage.title}</p>
          <p className="mt-2 text-lg font-semibold">{stage.action}</p>
          <p className="mt-2 text-sm leading-6 text-blue-100/80">{stage.detail}</p>
          <ul className="mt-5 grid gap-2.5 text-sm text-white/90">{stage.steps.map((step) => <li className="flex items-center gap-2" key={step}><CheckCircle2 className="size-4 shrink-0 text-teal-200" />{step}</li>)}</ul>
          <Button asChild className="mt-6 w-full rounded-xl bg-white text-primary hover:bg-white/90"><Link href={stage.href}>Continue your path <ArrowRight /></Link></Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 px-2 pb-1 text-xs text-blue-100/80"><span className="h-2 w-2 rounded-full bg-teal-200" />Your path. Our purpose.</div>
    </div>
  )
}
