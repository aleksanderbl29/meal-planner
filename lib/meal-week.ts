import { getISOWeek, getISOWeekYear, getISOWeeksInYear, startOfISOWeek, addWeeks } from "date-fns"
import type { Meal } from "./storage"

// Danish weeks start on Monday and belong to the year containing their Thursday.
export function getMealWeek(date: Date) {
  return { week: getISOWeek(date), year: getISOWeekYear(date) }
}

export function getMealWeekStart(week: number, year: number) {
  return addWeeks(startOfISOWeek(new Date(year, 0, 4)), week - 1)
}

export function getMealWeeksInYear(year: number) {
  return getISOWeeksInYear(new Date(year, 6, 1))
}

export function promoteMeal(meal: Meal, date: Date): Meal {
  return { ...meal, ...getMealWeek(date), isThisWeek: true, eaten: false }
}
