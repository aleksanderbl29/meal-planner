"use client"

import { useState, useEffect } from "react"
import { getWeek, getYear, format, startOfWeek, addWeeks } from "date-fns"
import { da } from "date-fns/locale"
import { Plus, Calendar, List, Edit, Trash2, Filter, MoreHorizontal, Loader2, Check, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { fetchMeals, createMeal, editMeal, removeMeal } from "./actions"

interface Meal {
  id: string
  name: string
  week: number
  year: number
  isThisWeek: boolean
  eaten?: boolean
}

export default function MealPlannerApp() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newMealName, setNewMealName] = useState("")
  const [newMealWeek, setNewMealWeek] = useState("")
  const [newMealYear, setNewMealYear] = useState("")
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [filter, setFilter] = useState<"all" | "thisWeek">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showAdvancedDatePicker, setShowAdvancedDatePicker] = useState(false)
  const [showEditAdvancedDatePicker, setShowEditAdvancedDatePicker] = useState(false)

  const currentWeek = getWeek(new Date())
  const currentYear = getYear(new Date())

  // Load meals on component mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true)
        const fetchedMeals = await fetchMeals()

        // Update isThisWeek property based on current date
        const updatedMeals = fetchedMeals.map((meal) => ({
          ...meal,
          isThisWeek: meal.week === currentWeek && meal.year === currentYear,
        }))
        setMeals(updatedMeals)
      } catch (error) {
        console.error("Failed to load meals:", error)
        // Fallback to localStorage if server actions fail
        const localMeals = localStorage.getItem("meals")
        if (localMeals) {
          const parsedMeals = JSON.parse(localMeals)
          const updatedMeals = parsedMeals.map((meal: Meal) => ({
            ...meal,
            isThisWeek: meal.week === currentWeek && meal.year === currentYear,
          }))
          setMeals(updatedMeals)
        }
      } finally {
        setLoading(false)
      }
    }

    loadMeals()
  }, [currentWeek, currentYear])

  // Backup to localStorage whenever meals change
  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem("meals", JSON.stringify(meals))
    }
  }, [meals])

  // Set default values for new meal
  useEffect(() => {
    if (!newMealWeek) setNewMealWeek(currentWeek.toString())
    if (!newMealYear) setNewMealYear(currentYear.toString())
  }, [currentWeek, currentYear, newMealWeek, newMealYear])

  const addMeal = async () => {
    if (!newMealName.trim() || !newMealWeek || !newMealYear || saving) return

    try {
      setSaving(true)
      const week = Number.parseInt(newMealWeek)
      const year = Number.parseInt(newMealYear)

      const newMeal = await createMeal({
        name: newMealName.trim(),
        week,
        year,
        isThisWeek: week === currentWeek && year === currentYear,
        eaten: false,
      })

      setMeals((prev) => [...prev, newMeal])
      setNewMealName("")
      setNewMealWeek(currentWeek.toString())
      setNewMealYear(currentYear.toString())
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add meal:", error)
      // Fallback to local-only operation
      const localMeal: Meal = {
        id: Date.now().toString(),
        name: newMealName.trim(),
        week: Number.parseInt(newMealWeek),
        year: Number.parseInt(newMealYear),
        isThisWeek: Number.parseInt(newMealWeek) === currentWeek && Number.parseInt(newMealYear) === currentYear,
        eaten: false,
      }
      setMeals((prev) => [...prev, localMeal])
      setNewMealName("")
      setNewMealWeek(currentWeek.toString())
      setNewMealYear(currentYear.toString())
      setIsAddDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const updateMeal = async () => {
    if (!editingMeal || !editingMeal.name.trim() || saving) return

    try {
      setSaving(true)
      const updatedMeal = {
        ...editingMeal,
        isThisWeek: editingMeal.week === currentWeek && editingMeal.year === currentYear,
      }

      await editMeal(updatedMeal)
      setMeals((prev) => prev.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)))
      setEditingMeal(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update meal:", error)
      // Fallback to local-only operation
      const updatedMeal = {
        ...editingMeal,
        isThisWeek: editingMeal.week === currentWeek && editingMeal.year === currentYear,
      }
      setMeals((prev) => prev.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)))
      setEditingMeal(null)
      setIsEditDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const deleteMeal = async (id: string) => {
    try {
      setSaving(true)
      await removeMeal(id)
      setMeals((prev) => prev.filter((meal) => meal.id !== id))
    } catch (error) {
      console.error("Failed to delete meal:", error)
      // Fallback to local-only operation
      setMeals((prev) => prev.filter((meal) => meal.id !== id))
    } finally {
      setSaving(false)
    }
  }

  const markAsEaten = async (id: string) => {
    try {
      setSaving(true)
      const mealToUpdate = meals.find((meal) => meal.id === id)
      if (!mealToUpdate) return

      // Move the meal to the current week and mark as eaten
      const updatedMeal = {
        ...mealToUpdate,
        week: currentWeek,
        year: currentYear,
        eaten: true,
      }

      await editMeal(updatedMeal)
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updatedMeal : meal)))
    } catch (error) {
      console.error("Failed to mark meal as eaten:", error)
      // Fallback to local-only operation
      const mealToUpdate = meals.find((meal) => meal.id === id)
      if (!mealToUpdate) return

      const updatedMeal = {
        ...mealToUpdate,
        week: currentWeek,
        year: currentYear,
        eaten: true,
      }
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updatedMeal : meal)))
    } finally {
      setSaving(false)
    }
  }

  const promoteToCurrentWeek = async (id: string) => {
    try {
      setSaving(true)
      const mealToUpdate = meals.find((meal) => meal.id === id)
      if (!mealToUpdate) return

      // Move the meal to the current week and clear eaten status
      const updatedMeal = {
        ...mealToUpdate,
        week: currentWeek,
        year: currentYear,
        eaten: false,
      }

      await editMeal(updatedMeal)
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updatedMeal : meal)))
    } catch (error) {
      console.error("Failed to promote meal to current week:", error)
      // Fallback to local-only operation
      const mealToUpdate = meals.find((meal) => meal.id === id)
      if (!mealToUpdate) return

      const updatedMeal = {
        ...mealToUpdate,
        week: currentWeek,
        year: currentYear,
        eaten: false,
      }
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updatedMeal : meal)))
    } finally {
      setSaving(false)
    }
  }

  const getWeekKey = (week: number, year: number) => `${year}-${week}`
  const getCurrentWeekKey = () => getWeekKey(currentWeek, currentYear)

  const upcomingMeals = meals
    .filter((meal) => {
      const mealWeekKey = getWeekKey(meal.week, meal.year)
      const currentWeekKey = getCurrentWeekKey()
      return mealWeekKey >= currentWeekKey
    })
    .filter((meal) => !meal.eaten) // Exclude eaten meals from upcoming
    .filter((meal) => filter === "all" || meal.isThisWeek)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.week - b.week
    })

  const historicMeals = meals
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.week - a.week
    })

  const getWeekDateRange = (week: number, year: number) => {
    const firstDayOfYear = new Date(year, 0, 1)
    const startOfTargetWeek = startOfWeek(addWeeks(firstDayOfYear, week - 1), { locale: da })
    const endOfTargetWeek = new Date(startOfTargetWeek)
    endOfTargetWeek.setDate(startOfTargetWeek.getDate() + 6)

    return {
      start: format(startOfTargetWeek, "d. MMM", { locale: da }),
      end: format(endOfTargetWeek, "d. MMM", { locale: da }),
    }
  }

  const getWeeksForCalendar = () => {
    const weeks = []
    for (let i = -2; i <= 4; i++) {
      let targetWeek = currentWeek + i
      let targetYear = currentYear

      if (targetWeek < 1) {
        targetYear -= 1
        targetWeek += 52
      } else if (targetWeek > 52) {
        targetYear += 1
        targetWeek -= 52
      }

      weeks.push({ week: targetWeek, year: targetYear })
    }
    return weeks
  }

  const getMealsForWeek = (week: number, year: number) => {
    return meals.filter((meal) => meal.week === week && meal.year === year)
  }

  const generateWeekOptions = () => {
    const options = []
    for (let i = 1; i <= 52; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          Uge {i}
        </SelectItem>,
      )
    }
    return options
  }

  const generateYearOptions = () => {
    const options = []
    const startYear = currentYear - 1
    const endYear = currentYear + 2
    for (let year = startYear; year <= endYear; year++) {
      options.push(
        <SelectItem key={year} value={year.toString()}>
          {year}
        </SelectItem>,
      )
    }
    return options
  }

  const setQuickWeek = (weeksFromNow: number) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + weeksFromNow * 7)
    const targetWeek = getWeek(targetDate)
    const targetYear = getYear(targetDate)

    setNewMealWeek(targetWeek.toString())
    setNewMealYear(targetYear.toString())
  }

  const setQuickWeekForEdit = (weeksFromNow: number) => {
    if (!editingMeal) return

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + weeksFromNow * 7)
    const targetWeek = getWeek(targetDate)
    const targetYear = getYear(targetDate)

    setEditingMeal({
      ...editingMeal,
      week: targetWeek,
      year: targetYear,
    })
  }

  const handleDatePickerChange = (dateString: string) => {
    if (!dateString) return

    const selectedDate = new Date(dateString)
    const selectedWeek = getWeek(selectedDate)
    const selectedYear = getYear(selectedDate)

    setNewMealWeek(selectedWeek.toString())
    setNewMealYear(selectedYear.toString())
  }

  const handleEditDatePickerChange = (dateString: string) => {
    if (!dateString || !editingMeal) return

    const selectedDate = new Date(dateString)
    const selectedWeek = getWeek(selectedDate)
    const selectedYear = getYear(selectedDate)

    setEditingMeal({
      ...editingMeal,
      week: selectedWeek,
      year: selectedYear,
    })
  }

  const getDateFromWeekYear = (week: number, year: number) => {
    const firstDayOfYear = new Date(year, 0, 1)
    const startOfTargetWeek = startOfWeek(addWeeks(firstDayOfYear, week - 1))
    return format(startOfTargetWeek, "yyyy-MM-dd")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600 font-light">Indlæser måltider...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-sf-display font-light text-slate-900 mb-3 tracking-tight">Måltidsplanlægger</h1>
          <p className="text-slate-600 font-sf-text font-light">Hvad skal vi have at spise i aften?</p>

          {saving && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <span className="text-sm text-slate-500">Gemmer...</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) {
                setShowAdvancedDatePicker(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6"
                disabled={saving}
              >
                <Plus className="w-4 h-4" />
                Tilføj måltid
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-0 shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-xl font-sf-display font-light text-slate-900">Nyt måltid</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="meal-name" className="text-slate-700 font-medium">
                    Navn
                  </Label>
                  <Input
                    id="meal-name"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    placeholder="Indtast måltidsnavn"
                    className="mt-2 border-slate-200 rounded-xl focus:border-slate-400 focus:ring-slate-400/20"
                    disabled={saving}
                    autoFocus={false}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Hvornår?</Label>

                  {/* Quick Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeek(0)}
                      disabled={saving}
                      className={`rounded-full border-slate-200 hover:bg-slate-50 ${
                        newMealWeek === currentWeek.toString() && newMealYear === currentYear.toString()
                          ? "bg-slate-100 border-slate-300"
                          : ""
                      }`}
                    >
                      Denne uge
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeek(1)}
                      disabled={saving}
                      className="rounded-full border-slate-200 hover:bg-slate-50"
                    >
                      Næste uge
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedDatePicker(!showAdvancedDatePicker)}
                      disabled={saving}
                      className="rounded-full text-slate-600 hover:bg-slate-50"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Selection */}
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    Valgt: Uge {newMealWeek}, {newMealYear}
                    {newMealWeek && newMealYear && (
                      <span className="ml-2 text-slate-500">
                        ({getWeekDateRange(Number.parseInt(newMealWeek), Number.parseInt(newMealYear)).start} -{" "}
                        {getWeekDateRange(Number.parseInt(newMealWeek), Number.parseInt(newMealYear)).end})
                      </span>
                    )}
                  </div>

                  {/* Advanced Options */}
                  {showAdvancedDatePicker && (
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      <div>
                        <Label htmlFor="date-picker" className="text-slate-700">
                          Vælg dato
                        </Label>
                        <Input
                          id="date-picker"
                          type="date"
                          onChange={(e) => handleDatePickerChange(e.target.value)}
                          className="mt-2 border-slate-200 rounded-xl"
                          disabled={saving}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Måltidet planlægges for ugen der indeholder denne dato
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meal-week" className="text-slate-700">
                            Uge
                          </Label>
                          <Select value={newMealWeek} onValueChange={setNewMealWeek} disabled={saving}>
                            <SelectTrigger className="mt-2 border-slate-200 rounded-xl">
                              <SelectValue placeholder="Vælg uge" />
                            </SelectTrigger>
                            <SelectContent>{generateWeekOptions()}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="meal-year" className="text-slate-700">
                            År
                          </Label>
                          <Select value={newMealYear} onValueChange={setNewMealYear} disabled={saving}>
                            <SelectTrigger className="mt-2 border-slate-200 rounded-xl">
                              <SelectValue placeholder="Vælg år" />
                            </SelectTrigger>
                            <SelectContent>{generateYearOptions()}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={addMeal}
                  className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl py-3"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Gemmer...
                    </>
                  ) : (
                    "Tilføj måltid"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={filter} onValueChange={(value: "all" | "thisWeek") => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48 border-slate-200 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle måltider</SelectItem>
              <SelectItem value="thisWeek">Kun denne uge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rest of the component remains the same... */}
        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1 mb-8">
            <TabsTrigger
              value="list"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <List className="w-4 h-4" />
              Kommende
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Kalender
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <List className="w-4 h-4" />
              Historik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {upcomingMeals.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500 font-light">Ingen måltider planlagt endnu</p>
                </CardContent>
              </Card>
            ) : (
              upcomingMeals.map((meal) => {
                const dateRange = getWeekDateRange(meal.week, meal.year)
                return (
                  <Card
                    key={meal.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl bg-white/80 backdrop-blur-sm group cursor-pointer"
                    onClick={() => {
                      setEditingMeal(meal)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-sf-display font-medium text-lg text-slate-900 mb-1">{meal.name}</h3>
                          <p className="text-slate-600 font-light">
                            Uge {meal.week}, {meal.year} • {dateRange.start} - {dateRange.end}
                          </p>
                          {meal.isThisWeek && (
                            <Badge
                              variant="secondary"
                              className="mt-3 bg-slate-100 text-slate-700 rounded-full px-3 py-1"
                            >
                              Denne uge
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsEaten(meal.id)
                            }}
                            className="rounded-full hover:bg-green-100 hover:text-green-700"
                            disabled={saving}
                            title="Marker som spist"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getWeeksForCalendar().map((weekInfo, index) => {
                const weekMeals = getMealsForWeek(weekInfo.week, weekInfo.year)
                const dateRange = getWeekDateRange(weekInfo.week, weekInfo.year)
                const isCurrentWeek = weekInfo.week === currentWeek && weekInfo.year === currentYear

                return (
                  <Card
                    key={index}
                    className={`min-h-32 border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm ${isCurrentWeek ? "ring-2 ring-slate-300" : ""}`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-900">
                        Uge {weekInfo.week}
                        <br />
                        <span className="text-xs text-slate-500 font-light">
                          {dateRange.start} - {dateRange.end}
                        </span>
                        {isCurrentWeek && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-slate-100 text-slate-700 rounded-full">
                            Nu
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {weekMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="text-xs p-2 bg-slate-100 text-slate-700 rounded-lg truncate font-medium"
                            title={meal.name}
                          >
                            {meal.name}
                          </div>
                        ))}
                        {weekMeals.length === 0 && <p className="text-xs text-slate-400 font-light">Ingen måltider</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historicMeals.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500 font-light">Ingen historiske måltider endnu</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-slate-600 font-light mb-6">
                  {historicMeals.length} måltider i alt
                </div>
                {historicMeals.map((meal) => {
                  const dateRange = getWeekDateRange(meal.week, meal.year)
                  return (
                    <Card
                      key={meal.id}
                      className="border-0 shadow-lg rounded-2xl bg-white/60 backdrop-blur-sm group opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => {
                        setEditingMeal(meal)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg text-slate-900 mb-1">{meal.name}</h3>
                            <p className="text-slate-600 font-light">
                              Uge {meal.week}, {meal.year} • {dateRange.start} - {dateRange.end}
                            </p>
                            <Badge
                              variant="outline"
                              className={`mt-3 rounded-full px-3 py-1 ${
                                meal.week < currentWeek || (meal.week === currentWeek && meal.year < currentYear)
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : meal.week === currentWeek && meal.year === currentYear
                                  ? "border-blue-300 text-blue-700 bg-blue-50"
                                  : "border-slate-300 text-slate-600"
                              }`}
                            >
                              {meal.week < currentWeek || (meal.week === currentWeek && meal.year < currentYear)
                                ? "Gennemført"
                                : meal.week === currentWeek && meal.year === currentYear
                                ? "Denne uge"
                                : "Planlagt"
                              }
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                promoteToCurrentWeek(meal.id)
                              }}
                              className="rounded-full hover:bg-blue-100 hover:text-blue-700"
                              disabled={saving}
                              title="Flyt til denne uge"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setShowEditAdvancedDatePicker(false)
            }
          }}
        >
          <DialogContent className="rounded-2xl border-0 shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-xl font-sf-display font-light text-slate-900">Rediger måltid</DialogTitle>
            </DialogHeader>
            {editingMeal && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="edit-meal-name" className="text-slate-700 font-medium">
                    Navn
                  </Label>
                  <Input
                    id="edit-meal-name"
                    value={editingMeal.name}
                    onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                    placeholder="Indtast måltidsnavn"
                    className="mt-2 border-slate-200 rounded-xl focus:border-slate-400 focus:ring-slate-400/20"
                    disabled={saving}
                    autoFocus={false}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Hvornår?</Label>

                  {/* Quick Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeekForEdit(0)}
                      disabled={saving}
                      className={`rounded-full border-slate-200 hover:bg-slate-50 ${
                        editingMeal.week === currentWeek && editingMeal.year === currentYear
                          ? "bg-slate-100 border-slate-300"
                          : ""
                      }`}
                    >
                      Denne uge
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeekForEdit(1)}
                      disabled={saving}
                      className="rounded-full border-slate-200 hover:bg-slate-50"
                    >
                      Næste uge
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditAdvancedDatePicker(!showEditAdvancedDatePicker)}
                      disabled={saving}
                      className="rounded-full text-slate-600 hover:bg-slate-50"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Selection */}
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    Valgt: Uge {editingMeal.week}, {editingMeal.year}
                    <span className="ml-2 text-slate-500">
                      ({getWeekDateRange(editingMeal.week, editingMeal.year).start} -{" "}
                      {getWeekDateRange(editingMeal.week, editingMeal.year).end})
                    </span>
                  </div>

                  {/* Advanced Options */}
                  {showEditAdvancedDatePicker && (
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      <div>
                        <Label htmlFor="edit-date-picker" className="text-slate-700">
                          Vælg dato
                        </Label>
                        <Input
                          id="edit-date-picker"
                          type="date"
                          defaultValue={getDateFromWeekYear(editingMeal.week, editingMeal.year)}
                          onChange={(e) => handleEditDatePickerChange(e.target.value)}
                          className="mt-2 border-slate-200 rounded-xl"
                          disabled={saving}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Måltidet planlægges for ugen der indeholder denne dato
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-meal-week" className="text-slate-700">
                            Uge
                          </Label>
                          <Select
                            value={editingMeal.week.toString()}
                            onValueChange={(value) => setEditingMeal({ ...editingMeal, week: Number.parseInt(value) })}
                            disabled={saving}
                          >
                            <SelectTrigger className="mt-2 border-slate-200 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>{generateWeekOptions()}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-meal-year" className="text-slate-700">
                            År
                          </Label>
                          <Select
                            value={editingMeal.year.toString()}
                            onValueChange={(value) => setEditingMeal({ ...editingMeal, year: Number.parseInt(value) })}
                            disabled={saving}
                          >
                            <SelectTrigger className="mt-2 border-slate-200 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>{generateYearOptions()}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={updateMeal}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-xl py-3"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Opdaterer...
                      </>
                    ) : (
                      "Opdater måltid"
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="px-6 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-light">Slet måltid</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                          Er du sikker på, at du vil slette "{editingMeal?.name}"? Dette kan ikke fortrydes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Annuller</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (editingMeal) {
                              deleteMeal(editingMeal.id)
                              setIsEditDialogOpen(false)
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Sletter...
                            </>
                          ) : (
                            "Slet"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
