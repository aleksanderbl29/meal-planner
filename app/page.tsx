"use client"

import { useState, useEffect } from "react"
import { getWeek, getYear, format, startOfWeek, addWeeks } from "date-fns"
import { Plus, Calendar, List, Edit, Trash2, Filter } from "lucide-react"
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

interface Meal {
  id: string
  name: string
  week: number
  year: number
  isThisWeek: boolean
}

export default function MealPlannerApp() {
  const [meals, setMeals] = useState<Meal[]>([])
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

  // Load meals from localStorage on component mount
  useEffect(() => {
    const savedMeals = localStorage.getItem("meals")
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals))
    }
  }, [])

  // Save meals to localStorage whenever meals change
  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals))
  }, [meals])

  // Set default values for new meal
  useEffect(() => {
    if (!newMealWeek) setNewMealWeek(currentWeek.toString())
    if (!newMealYear) setNewMealYear(currentYear.toString())
  }, [currentWeek, currentYear, newMealWeek, newMealYear])

  const addMeal = () => {
    if (!newMealName.trim() || !newMealWeek || !newMealYear) return

    const week = Number.parseInt(newMealWeek)
    const year = Number.parseInt(newMealYear)

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMealName.trim(),
      week,
      year,
      isThisWeek: week === currentWeek && year === currentYear,
    }

    setMeals((prev) => [...prev, meal])
    setNewMealName("")
    setNewMealWeek(currentWeek.toString())
    setNewMealYear(currentYear.toString())
    setIsAddDialogOpen(false)
  }

  const updateMeal = () => {
    if (!editingMeal || !editingMeal.name.trim()) return

    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === editingMeal.id
          ? {
              ...editingMeal,
              isThisWeek: editingMeal.week === currentWeek && editingMeal.year === currentYear,
            }
          : meal,
      ),
    )
    setEditingMeal(null)
    setIsEditDialogOpen(false)
  }

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id))
  }

  const getWeekKey = (week: number, year: number) => `${year}-${week}`
  const getCurrentWeekKey = () => getWeekKey(currentWeek, currentYear)

  const upcomingMeals = meals
    .filter((meal) => {
      const mealWeekKey = getWeekKey(meal.week, meal.year)
      const currentWeekKey = getCurrentWeekKey()
      return mealWeekKey >= currentWeekKey
    })
    .filter((meal) => filter === "all" || meal.isThisWeek)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.week - b.week
    })

  const historicMeals = meals
    .filter((meal) => {
      const mealWeekKey = getWeekKey(meal.week, meal.year)
      const currentWeekKey = getCurrentWeekKey()
      return mealWeekKey < currentWeekKey
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.week - a.week
    })

  const getWeekDateRange = (week: number, year: number) => {
    // Create a date for the first day of the year
    const firstDayOfYear = new Date(year, 0, 1)
    // Calculate the start of the specified week
    const startOfTargetWeek = startOfWeek(addWeeks(firstDayOfYear, week - 1))
    const endOfTargetWeek = new Date(startOfTargetWeek)
    endOfTargetWeek.setDate(startOfTargetWeek.getDate() + 6)

    return {
      start: format(startOfTargetWeek, "MMM d"),
      end: format(endOfTargetWeek, "MMM d, yyyy"),
    }
  }

  const getWeeksForCalendar = () => {
    const weeks = []
    for (let i = -2; i <= 4; i++) {
      let targetWeek = currentWeek + i
      let targetYear = currentYear

      if (targetWeek < 1) {
        targetYear -= 1
        targetWeek += 52 // Approximate, but good enough for display
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
          Week {i}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planner</h1>
          <p className="text-gray-600">Plan and organize your meals by week</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meal-name">Meal Name</Label>
                  <Input
                    id="meal-name"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    placeholder="Enter meal name"
                  />
                </div>
                <div className="space-y-3">
                  <Label>When do you want this meal?</Label>

                  {/* Quick Selection Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeek(0)}
                      className={
                        newMealWeek === currentWeek.toString() && newMealYear === currentYear.toString()
                          ? "bg-blue-100 border-blue-300"
                          : ""
                      }
                    >
                      This Week
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setQuickWeek(1)}>
                      Next Week
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedDatePicker(!showAdvancedDatePicker)}
                    >
                      {showAdvancedDatePicker ? "Hide" : "More"} Options
                    </Button>
                  </div>

                  {/* Current Selection Display */}
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Selected: Week {newMealWeek}, {newMealYear}
                    {newMealWeek && newMealYear && (
                      <span className="ml-2">
                        ({getWeekDateRange(Number.parseInt(newMealWeek), Number.parseInt(newMealYear)).start} -{" "}
                        {getWeekDateRange(Number.parseInt(newMealWeek), Number.parseInt(newMealYear)).end})
                      </span>
                    )}
                  </div>

                  {/* Advanced Date Picker */}
                  {showAdvancedDatePicker && (
                    <div className="space-y-3 border-t pt-3">
                      <div>
                        <Label htmlFor="date-picker">Pick a specific date</Label>
                        <Input
                          id="date-picker"
                          type="date"
                          onChange={(e) => handleDatePickerChange(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The meal will be planned for the week containing this date
                        </p>
                      </div>

                      <div className="text-sm text-gray-600">Or select manually:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meal-week">Week</Label>
                          <Select value={newMealWeek} onValueChange={setNewMealWeek}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select week" />
                            </SelectTrigger>
                            <SelectContent>{generateWeekOptions()}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="meal-year">Year</Label>
                          <Select value={newMealYear} onValueChange={setNewMealYear}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>{generateYearOptions()}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={addMeal} className="w-full">
                  Add Meal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={filter} onValueChange={(value: "all" | "thisWeek") => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="thisWeek">This Week Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {upcomingMeals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No meals planned yet. Add your first meal!</p>
                </CardContent>
              </Card>
            ) : (
              upcomingMeals.map((meal) => {
                const dateRange = getWeekDateRange(meal.week, meal.year)
                return (
                  <Card key={meal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{meal.name}</h3>
                          <p className="text-gray-600">
                            Week {meal.week}, {meal.year} ({dateRange.start} - {dateRange.end})
                          </p>
                          {meal.isThisWeek && (
                            <Badge variant="secondary" className="mt-2">
                              This Week
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingMeal(meal)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Meal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{meal.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMeal(meal.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                  <Card key={index} className={`min-h-32 ${isCurrentWeek ? "ring-2 ring-blue-500" : ""}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Week {weekInfo.week}, {weekInfo.year}
                        <br />
                        <span className="text-xs text-gray-500">
                          {dateRange.start} - {dateRange.end}
                        </span>
                        {isCurrentWeek && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        {weekMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="text-xs p-2 bg-blue-100 text-blue-800 rounded truncate"
                            title={meal.name}
                          >
                            {meal.name}
                          </div>
                        ))}
                        {weekMeals.length === 0 && <p className="text-xs text-gray-400">No meals</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historicMeals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No historic meals yet. Your completed meals will appear here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Showing {historicMeals.length} completed meal{historicMeals.length !== 1 ? "s" : ""}
                </div>
                {historicMeals.map((meal) => {
                  const dateRange = getWeekDateRange(meal.week, meal.year)
                  return (
                    <Card key={meal.id} className="hover:shadow-md transition-shadow opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{meal.name}</h3>
                            <p className="text-gray-600">
                              Week {meal.week}, {meal.year} ({dateRange.start} - {dateRange.end})
                            </p>
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingMeal(meal)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Meal</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{meal.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMeal(meal.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Meal</DialogTitle>
            </DialogHeader>
            {editingMeal && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-meal-name">Meal Name</Label>
                  <Input
                    id="edit-meal-name"
                    value={editingMeal.name}
                    onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                    placeholder="Enter meal name"
                  />
                </div>
                <div className="space-y-3">
                  <Label>When do you want this meal?</Label>

                  {/* Quick Selection Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickWeekForEdit(0)}
                      className={
                        editingMeal.week === currentWeek && editingMeal.year === currentYear
                          ? "bg-blue-100 border-blue-300"
                          : ""
                      }
                    >
                      This Week
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setQuickWeekForEdit(1)}>
                      Next Week
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditAdvancedDatePicker(!showEditAdvancedDatePicker)}
                    >
                      {showEditAdvancedDatePicker ? "Hide" : "More"} Options
                    </Button>
                  </div>

                  {/* Current Selection Display */}
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Selected: Week {editingMeal.week}, {editingMeal.year}
                    <span className="ml-2">
                      ({getWeekDateRange(editingMeal.week, editingMeal.year).start} -{" "}
                      {getWeekDateRange(editingMeal.week, editingMeal.year).end})
                    </span>
                  </div>

                  {/* Advanced Date Picker */}
                  {showEditAdvancedDatePicker && (
                    <div className="space-y-3 border-t pt-3">
                      <div>
                        <Label htmlFor="edit-date-picker">Pick a specific date</Label>
                        <Input
                          id="edit-date-picker"
                          type="date"
                          defaultValue={getDateFromWeekYear(editingMeal.week, editingMeal.year)}
                          onChange={(e) => handleEditDatePickerChange(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The meal will be planned for the week containing this date
                        </p>
                      </div>

                      <div className="text-sm text-gray-600">Or select manually:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-meal-week">Week</Label>
                          <Select
                            value={editingMeal.week.toString()}
                            onValueChange={(value) => setEditingMeal({ ...editingMeal, week: Number.parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>{generateWeekOptions()}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-meal-year">Year</Label>
                          <Select
                            value={editingMeal.year.toString()}
                            onValueChange={(value) => setEditingMeal({ ...editingMeal, year: Number.parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>{generateYearOptions()}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={updateMeal} className="w-full">
                  Update Meal
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
