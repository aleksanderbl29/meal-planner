"use server"

import { getMeals, addMeal, updateMeal, deleteMeal, type Meal } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export async function fetchMeals() {
  try {
    return await getMeals()
  } catch (error) {
    console.error("Error in fetchMeals:", error)
    return []
  }
}

export async function createMeal(meal: Omit<Meal, "id">) {
  try {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
    }

    await addMeal(newMeal)
    revalidatePath("/")
    return newMeal
  } catch (error) {
    console.error("Error in createMeal:", error)
    throw new Error("Failed to create meal")
  }
}

export async function editMeal(meal: Meal) {
  try {
    await updateMeal(meal)
    revalidatePath("/")
    return meal
  } catch (error) {
    console.error("Error in editMeal:", error)
    throw new Error("Failed to update meal")
  }
}

export async function removeMeal(mealId: string) {
  try {
    await deleteMeal(mealId)
    revalidatePath("/")
  } catch (error) {
    console.error("Error in removeMeal:", error)
    throw new Error("Failed to delete meal")
  }
}
