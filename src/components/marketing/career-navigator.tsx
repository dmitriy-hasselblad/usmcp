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
        <div className="mt-5 flex flex-wrap gap-2">
          {stages.map((item, index) => (
            <button className={index === selectedStage ? "rounded-full bg-teal-200 px-3 py-1.5 text-xs font-bold text-slate-950" : "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/[0.14]"} key={item.title} onClick={() => setSelectedStage(index)} type="button">{item.title}</button>
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
