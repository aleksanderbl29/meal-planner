import assert from "node:assert/strict"
import { test } from "node:test"
import { getMeals, addMeal, updateMeal } from "../lib/storage.ts"

test("legacy meals and optional feedback survive storage, edits and clearing", async () => {
  const values = new Map()
  globalThis.window = {}
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  try {
    const legacy = { id: "1", name: "Lasagne", week: 44, year: 2026, isThisWeek: true }
    values.set("meals", JSON.stringify([legacy]))
    assert.deepEqual(await getMeals(), [legacy])
    for (const rating of ["up", "down"]) {
      await updateMeal({ ...legacy, rating, note: "Mere grønt næste gang\nMindre salt" })
      const [saved] = await getMeals()
      assert.equal(saved.rating, rating)
      assert.equal(saved.note, "Mere grønt næste gang\nMindre salt")
      await updateMeal({ ...saved, name: "Grøn lasagne", week: 45, eaten: true })
      const [edited] = await getMeals()
      assert.equal(edited.rating, rating)
      assert.equal(edited.note, saved.note)
    }
    await updateMeal({ ...legacy, rating: undefined, note: "" })
    assert.equal((await getMeals())[0].rating, undefined)
    assert.equal((await getMeals())[0].note, "")
    await updateMeal({ ...legacy, note: "Kun en note" })
    assert.equal((await getMeals())[0].note, "Kun en note")
    await addMeal({ ...legacy, id: "2", rating: "up" })
    assert.equal((await getMeals())[1].rating, "up")
  } finally {
    delete globalThis.window
    delete globalThis.localStorage
  }
})
