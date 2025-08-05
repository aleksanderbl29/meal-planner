export interface Meal {
  id: string
  name: string
  week: number
  year: number
  isThisWeek: boolean
}

const MEALS_KEY = "meals"

// Check if we're in a server environment and have KV credentials
const hasKVCredentials = () => {
  return typeof window === "undefined" && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
}

// Fallback to localStorage when KV is not available
const getLocalStorageMeals = (): Meal[] => {
  if (typeof window === "undefined") return []
  try {
    const meals = localStorage.getItem(MEALS_KEY)
    return meals ? JSON.parse(meals) : []
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return []
  }
}

const saveLocalStorageMeals = (meals: Meal[]): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

export async function getMeals(): Promise<Meal[]> {
  // If we don't have KV credentials, use localStorage
  if (!hasKVCredentials()) {
    return getLocalStorageMeals()
  }

  try {
    const { kv } = await import("@vercel/kv")
    const meals = await kv.get<Meal[]>(MEALS_KEY)
    return meals || []
  } catch (error) {
    console.error("Error fetching meals from KV, falling back to localStorage:", error)
    return getLocalStorageMeals()
  }
}

export async function saveMeals(meals: Meal[]): Promise<void> {
  // Always save to localStorage as backup
  saveLocalStorageMeals(meals)

  // If we don't have KV credentials, only use localStorage
  if (!hasKVCredentials()) {
    return
  }

  try {
    const { kv } = await import("@vercel/kv")
    await kv.set(MEALS_KEY, meals)
  } catch (error) {
    console.error("Error saving meals to KV:", error)
    // Don't throw error, localStorage backup is already saved
  }
}

export async function addMeal(meal: Meal): Promise<Meal[]> {
  try {
    const currentMeals = await getMeals()
    const updatedMeals = [...currentMeals, meal]
    await saveMeals(updatedMeals)
    return updatedMeals
  } catch (error) {
    console.error("Error adding meal:", error)
    throw error
  }
}

export async function updateMeal(updatedMeal: Meal): Promise<Meal[]> {
  try {
    const currentMeals = await getMeals()
    const updatedMeals = currentMeals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal))
    await saveMeals(updatedMeals)
    return updatedMeals
  } catch (error) {
    console.error("Error updating meal:", error)
    throw error
  }
}

export async function deleteMeal(mealId: string): Promise<Meal[]> {
  try {
    const currentMeals = await getMeals()
    const updatedMeals = currentMeals.filter((meal) => meal.id !== mealId)
    await saveMeals(updatedMeals)
    return updatedMeals
  } catch (error) {
    console.error("Error deleting meal:", error)
    throw error
  }
}
