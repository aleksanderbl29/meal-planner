export function mealFamily(name: string): string {
  const normalized = name.normalize("NFC").toLocaleLowerCase("da-DK")
    .replace(new RegExp("[^\\p{L}\\p{N}\\s]", "gu"), " ").trim().replace(/\s+/g, " ")
  const [base = ""] = normalized.split(/\s+med\s+/)
  return base === "med" || base.length < 2 ? "" : base
}

export function findSimilarMeals<T extends { id: string; name: string }>({
  name, meals, excludeId,
}: {
  name: string
  meals: readonly T[]
  excludeId?: string
}): T[] {
  const family = mealFamily(name)
  if (!family) return []
  return meals.filter((meal) => meal.id !== excludeId && mealFamily(meal.name) === family)
}
