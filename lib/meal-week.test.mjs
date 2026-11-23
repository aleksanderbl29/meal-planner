import assert from "node:assert/strict"
import { test } from "node:test"
import { getMealWeek, getMealWeekStart, getMealWeeksInYear, promoteMeal } from "./meal-week.ts"

const meal = { id: "meal-1", name: "Frikadeller", week: 12, year: 2024, isThisWeek: false, eaten: true }

test("week selection includes week 53 only in ISO years with 53 weeks", () => {
  assert.equal(getMealWeeksInYear(2026), 53)
  assert.equal(getMealWeeksInYear(2027), 52)
})

for (const [date, week, year] of [
  [new Date(2026, 9, 29), 44, 2026],
  [new Date(2026, 9, 25), 43, 2026],
  [new Date(2027, 0, 1), 53, 2026],
  [new Date(2027, 0, 3), 53, 2026],
  [new Date(2027, 0, 4), 1, 2027],
  [new Date(2024, 11, 30), 1, 2025],
]) {
  test(`promotion for ${date.toDateString()}`, () => {
    const promoted = promoteMeal(meal, date)
    assert.deepEqual(promoted, { ...meal, week, year, isThisWeek: true, eaten: false })
    assert.equal(meal.eaten, true)
    assert.equal(meal.week, 12)
    assert.deepEqual(getMealWeek(date), { week, year })
    assert.deepEqual(getMealWeek(getMealWeekStart(week, year)), { week, year })
    assert.equal(getMealWeekStart(week, year).getDay(), 1)
    assert.deepEqual(promoteMeal(promoted, date), promoted)
  })
}

test("missing optional eaten status is reset when promoted", () => {
  const { eaten, ...uneaten } = meal
  assert.equal(promoteMeal(uneaten, new Date(2026, 9, 29)).eaten, false)
})

test("storage persists promotion without changing another meal", async () => {
  const { getMeals, updateMeal } = await import("./storage.ts")
  const other = { ...meal, id: "meal-2", name: "Suppe" }
  const entries = new Map([["meals", JSON.stringify([meal, other])]])
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} })
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    },
  })
  try {
    const promoted = promoteMeal(meal, new Date(2027, 0, 1))
    await updateMeal(promoted)
    assert.deepEqual(await getMeals(), [promoted, other])
    assert.deepEqual(JSON.parse(entries.get("meals")), [promoted, other])
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow)
    else delete globalThis.window
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage)
    else delete globalThis.localStorage
  }
})

test("week ranges start on the correct Monday across years", () => {
  assert.deepEqual(getMealWeekStart(53, 2026), new Date(2026, 11, 28))
  assert.deepEqual(getMealWeekStart(1, 2027), new Date(2027, 0, 4))
  assert.deepEqual(getMealWeekStart(1, 2025), new Date(2024, 11, 30))
})
