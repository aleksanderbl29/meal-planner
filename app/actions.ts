"use server"

import { auth } from "@clerk/nextjs/server"
import { getMeals, addMeal, updateMeal, deleteMeal, type Meal } from "@/lib/storage"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function fetchMeals() {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Authentication required")
    }

    return await getMeals()
  } catch (error) {
    console.error("Error in fetchMeals:", error)
    return []
  }
}

export async function createMeal(meal: Omit<Meal, "id">) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Authentication required")
    }

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

const editedMealSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(1).max(9999),
  isThisWeek: z.boolean(),
  eaten: z.boolean().optional(),
})

export async function editMeal(meal: Meal) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Authentication required")
    }

    const updatedMeal = editedMealSchema.parse(meal)
    await updateMeal(updatedMeal)
    revalidatePath("/")
    return updatedMeal
  } catch (error) {
    console.error("Error in editMeal:", error)
    throw new Error("Failed to update meal")
  }
}

export async function removeMeal(mealId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Authentication required")
    }

    await deleteMeal(mealId)
    revalidatePath("/")
  } catch (error) {
    console.error("Error in removeMeal:", error)
    throw new Error("Failed to delete meal")
  }
}
