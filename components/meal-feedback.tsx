"use client"

import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Meal } from "@/lib/storage"

export function MealFeedback({ meal, onChange, disabled }: {
  meal: Meal
  onChange: (meal: Meal) => void
  disabled: boolean
}) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-slate-700 font-medium">Vurdering (valgfri)</legend>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={meal.rating === "up" ? "secondary" : "outline"}
          aria-pressed={meal.rating === "up"} disabled={disabled}
          className="rounded-full border-slate-200"
          onClick={() => onChange({ ...meal, rating: meal.rating === "up" ? undefined : "up" })}>
          <ThumbsUp aria-hidden="true" className="w-4 h-4" /> Godt
        </Button>
        <Button type="button" variant={meal.rating === "down" ? "secondary" : "outline"}
          aria-pressed={meal.rating === "down"} disabled={disabled}
          className="rounded-full border-slate-200"
          onClick={() => onChange({ ...meal, rating: meal.rating === "down" ? undefined : "down" })}>
          <ThumbsDown aria-hidden="true" className="w-4 h-4" /> Mindre godt
        </Button>
      </div>
      <p className="text-xs text-slate-500">Tryk igen for at fjerne vurderingen.</p>
      <div>
        <Label htmlFor="meal-note" className="text-slate-700">Note (valgfri)</Label>
        <textarea id="meal-note" value={meal.note ?? ""} disabled={disabled} rows={3}
          onChange={(event) => onChange({ ...meal, note: event.target.value })}
          placeholder="Hvad vil du huske om måltidet?"
          className="mt-2 flex w-full border border-slate-200 bg-transparent px-3 py-2 text-sm rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/20 disabled:cursor-not-allowed disabled:opacity-50" />
      </div>
    </fieldset>
  )
}

export function MealFeedbackSummary({ meal }: { meal: Meal }) {
  if (!meal.rating && !meal.note) return null
  return (
    <div className="my-2 space-y-1 text-sm text-slate-600">
      {meal.rating && (
        <p className="flex items-center gap-2">
          {meal.rating === "up" ? <ThumbsUp aria-hidden="true" className="w-4 h-4" /> : <ThumbsDown aria-hidden="true" className="w-4 h-4" />}
          {meal.rating === "up" ? "Godt" : "Mindre godt"}
        </p>
      )}
      {meal.note && <p className="whitespace-pre-wrap break-words">{meal.note}</p>}
    </div>
  )
}
