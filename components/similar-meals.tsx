import { findSimilarMeals, mealFamily } from "@/lib/similar-meals"
import type { Meal } from "@/lib/storage"

export function SimilarMeals({ name, meals, excludeId }: {
  name: string
  meals: readonly Meal[]
  excludeId?: string
}) {
  const matches = findSimilarMeals({ name, meals, excludeId })
  if (matches.length === 0) return null

  return (
    <div className="mt-3 text-sm text-slate-600" role="status" aria-live="polite">
      <p className="font-medium">Lignende retter · {mealFamily(name)}</p>
      <p className="mt-1">Samme grundnavn før “med”. Måltider og historik gemmes hver for sig.</p>
      <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 break-words">
        {matches.map((meal) => (
          <li key={meal.id}>{meal.name} · Uge {meal.week}, {meal.year}</li>
        ))}
      </ul>
    </div>
  )
}
