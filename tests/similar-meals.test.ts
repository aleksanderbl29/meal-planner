import assert from "node:assert/strict"
import test from "node:test"
import { findSimilarMeals, mealFamily } from "../lib/similar-meals"

const meals = [
  { id: "1", name: "Wok med kylling", week: 1, year: 2025, eaten: true },
  { id: "2", name: "Wok med tofu", week: 3, year: 2026, eaten: false },
  { id: "3", name: "Pasta med tofu", week: 4, year: 2026, eaten: false },
  { id: "4", name: "Grøn wok med tofu", week: 5, year: 2026, eaten: false },
]

test("associates chicken and tofu wok without matching shared ingredients", () => {
  assert.deepEqual(findSimilarMeals({ name: "Wok med kylling", meals }).map((meal) => meal.id), ["1", "2"])
  assert.deepEqual(findSimilarMeals({ name: "Lasagne", meals }), [])
})

test("normalizes case, punctuation, whitespace and Unicode", () => {
  assert.equal(mealFamily("  WOK:  MED   tofu! "), "wok")
  assert.equal(mealFamily("ÆRTEPURÉ med fisk"), mealFamily("ærtepure\u0301 med tofu"))
  assert.equal(mealFamily("Medaljoner med svampe"), "medaljoner")
  assert.equal(mealFamily("Wok med"), "wok")
})

test("allows bare dish names but does not use substring or fuzzy matching", () => {
  assert.equal(findSimilarMeals({ name: "Wok", meals }).length, 2)
  assert.deepEqual(findSimilarMeals({ name: "Wo", meals }), [])
  assert.deepEqual(findSimilarMeals({ name: "Tofu wok", meals }), [])
})

test("ignores empty, punctuation-only and incomplete base names", () => {
  for (const name of ["", "  ", "!!!", "med", "med tofu", "a med tofu"]) {
    assert.equal(mealFamily(name), "")
    assert.deepEqual(findSimilarMeals({ name, meals }), [])
  }
})

test("excludes only the current id and retains repeated meal history", () => {
  const repeated = [...meals, { ...meals[0], id: "5", week: 8 }]
  assert.deepEqual(findSimilarMeals({ name: "Wok med tofu", meals: repeated, excludeId: "2" })
    .map((meal) => meal.id), ["1", "5"])
})

test("returns original records without changing names, dates, status or order", () => {
  const before = structuredClone(meals)
  const matches = findSimilarMeals({ name: "Wok med tofu", meals })
  assert.equal(matches[0], meals[0])
  assert.deepEqual(meals, before)
  assert.deepEqual(matches, before.slice(0, 2))
})
