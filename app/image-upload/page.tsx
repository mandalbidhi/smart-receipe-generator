"use client"

import type React from "react"

import { useState } from "react"
import { RecipeDatabase } from "@/lib/recipe-database"
import { RecipeCard } from "@/components/recipe-card"
import { Upload, ArrowLeft, X, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { RecipeDetail } from "@/components/recipe-detail"

const INGREDIENT_PATTERNS: Record<
  string,
  {
    colors: string[]
    keywords: string[]
  }
> = {
  Potato: { colors: ["brown", "8b4513", "a0522d"], keywords: ["potato", "brown"] },
  Tomato: { colors: ["red", "ff0000", "ff4444"], keywords: ["tomato", "red", "round"] },
  Chicken: { colors: ["yellow", "ffff00", "ffcc99"], keywords: ["chicken", "poultry"] },
  Broccoli: { colors: ["green", "00ff00", "228b22"], keywords: ["broccoli", "green"] },
  Carrot: { colors: ["orange", "ff8c00", "ffa500"], keywords: ["carrot", "orange"] },
  Garlic: { colors: ["white", "ffffff", "f5f5f5"], keywords: ["garlic", "white"] },
  Onion: { colors: ["yellow", "golden", "ff00ff"], keywords: ["onion", "layers"] },
  Lettuce: { colors: ["green", "00ff00", "90ee90"], keywords: ["lettuce", "leafy"] },
  Cheese: { colors: ["yellow", "ffff00", "ffd700"], keywords: ["cheese", "yellow"] },
  Egg: { colors: ["white", "ffffff", "fffacd"], keywords: ["egg", "oval"] },
  Mushroom: { colors: ["brown", "8b4513", "d2691e"], keywords: ["mushroom", "brown"] },
  Spinach: { colors: ["green", "006400", "228b22"], keywords: ["spinach", "dark"] },
  Pepper: { colors: ["red", "ff0000", "ff6347"], keywords: ["pepper", "red"] },
  "Bell Peppers": { colors: ["red", "ff0000", "ff6347"], keywords: ["pepper", "red", "bell"] },
  OliveOil: { colors: ["golden", "ffd700", "daa520"], keywords: ["oil", "golden"] },
  Salmon: { colors: ["pink", "ff69b4", "ffb6c1"], keywords: ["salmon", "pink"] },
  Rice: { colors: ["white", "ffffff", "f5f5dc"], keywords: ["rice", "grain"] },
  Pasta: { colors: ["yellow", "ffff00", "ffd700"], keywords: ["pasta", "noodle"] },
  Milk: { colors: ["white", "ffffff", "f0f8ff"], keywords: ["milk", "dairy"] },
  Honey: { colors: ["golden", "ffd700", "daa520"], keywords: ["honey", "golden"] },
  Lemon: { colors: ["yellow", "ffff00", "ffd700"], keywords: ["lemon", "citrus"] },
}

function analyzeImageColors(canvas: HTMLCanvasElement): Record<string, number> {
  try {
    const ctx = canvas.getContext("2d")
    if (!ctx) return {}

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const colorCounts: Record<string, number> = {}

    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a < 128) continue

      let colorGroup = "other"
      if (r > 200 && g < 100 && b < 100) colorGroup = "red"
      else if (r > 200 && g > 150 && b < 100) colorGroup = "orange"
      else if (r > 200 && g > 200 && b < 100) colorGroup = "yellow"
      else if (r < 100 && g > 150 && b < 100) colorGroup = "green"
      else if (r < 100 && g < 100 && b > 150) colorGroup = "blue"
      else if (r > 150 && g < 150 && b > 150) colorGroup = "purple"
      else if (r > 180 && g > 150 && b < 150) colorGroup = "brown"
      else if (r > 200 && g > 200 && b > 200) colorGroup = "white"
      else if (r < 100 && g < 100 && b < 100) colorGroup = "dark"

      colorCounts[colorGroup] = (colorCounts[colorGroup] || 0) + 1
    }

    return colorCounts
  } catch (err) {
    console.log("[v0] Color analysis error:", err)
    return {}
  }
}

export default function ImageUploadPage() {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  const recipes = RecipeDatabase.getRecipes()
  const allIngredients = RecipeDatabase.getAllIngredients()

  const matchedRecipes = recipes
    .map((recipe) => {
      if (detectedIngredients.length === 0) {
        return { ...recipe, matchScore: 0, matchedCount: 0 }
      }

      // Check if ALL detected ingredients are in the recipe
      const allIngredientsFound = detectedIngredients.every((detectedIng) => {
        return recipe.ingredients.some((recipeIng) => {
          const detected = detectedIng.toLowerCase()
          const recipeIngName = recipeIng.name.toLowerCase()
          return recipeIngName === detected || recipeIngName.includes(detected) || detected.includes(recipeIngName)
        })
      })

      if (!allIngredientsFound) {
        return { ...recipe, matchScore: 0, matchedCount: 0, isExcluded: true }
      }

      // Calculate match score based on how many recipe ingredients are covered
      let additionalMatches = 0
      recipe.ingredients.forEach((recipeIng) => {
        const recipeIngName = recipeIng.name.toLowerCase()
        detectedIngredients.forEach((detectedIng) => {
          const detected = detectedIng.toLowerCase()
          if (recipeIngName === detected || recipeIngName.includes(detected)) {
            additionalMatches++
          }
        })
      })

      const matchScore = 100 + additionalMatches * 5

      return {
        ...recipe,
        matchScore,
        matchedCount: detectedIngredients.length,
        isExcluded: false,
      }
    })
    .filter((recipe) => !recipe.isExcluded)
    .sort((a, b) => b.matchScore - a.matchScore)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)
    setDetectedIngredients([])

    try {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"

          img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = 200
            canvas.height = 200
            const ctx = canvas.getContext("2d")
            if (!ctx) {
              setError("Unable to process image")
              setIsProcessing(false)
              return
            }

            ctx.drawImage(img, 0, 0, 200, 200)

            const colors = analyzeImageColors(canvas)
            const detectedIngs: Set<string> = new Set()

            for (const [ingredient, pattern] of Object.entries(INGREDIENT_PATTERNS)) {
              if (!allIngredients.includes(ingredient)) continue

              const colorMatch = pattern.colors.some((color) => {
                if (color === "red" && (colors.red || colors.orange)) return true
                if (color === "green" && colors.green) return true
                if (color === "orange" && (colors.orange || colors.yellow)) return true
                if (color === "yellow" && colors.yellow) return true
                if (color === "white" && colors.white) return true
                if (color === "brown" && colors.brown) return true
                return false
              })

              if (colorMatch && !detectedIngs.has(ingredient)) {
                detectedIngs.add(ingredient)
              }
            }

            const newIngredients = Array.from(detectedIngs)
            if (newIngredients.length > 0) {
              setDetectedIngredients(newIngredients)
              setError(null)
              setSuccessMessage(
                `Image uploaded successfully! Detected ${newIngredients.length} ingredient${newIngredients.length > 1 ? "s" : ""}: ${newIngredients.join(", ")}`,
              )
              setTimeout(() => setSuccessMessage(null), 5000)
            } else {
              setError("No common ingredients detected. Try uploading a clearer food image.")
            }
          }

          img.onerror = () => {
            setError("Unable to load image. Please try another file.")
          }

          img.src = event.target?.result as string
        } catch (err) {
          console.log("[v0] Image processing error:", err)
          setError("Unable to process image. Please try again.")
        } finally {
          setIsProcessing(false)
        }
      }

      reader.onerror = () => {
        setError("Unable to read file")
        setIsProcessing(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      console.log("[v0] File reading error:", err)
      setError("Unable to process image. Please try again.")
      setIsProcessing(false)
    }
  }

  const toggleFavorite = (recipeId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId)
    } else {
      newFavorites.add(recipeId)
    }
    setFavorites(newFavorites)
  }

  const handleRating = (recipeId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [recipeId]: rating,
    }))
  }

  const selectedRecipe = selectedRecipeId ? recipes.find((r) => r.id === selectedRecipeId) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Find Recipes from Image</h1>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
        </div>

        {selectedRecipe ? (
          <div>
            <button
              onClick={() => setSelectedRecipeId(null)}
              className="mb-6 text-orange-600 dark:text-orange-400 hover:underline font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to results
            </button>
            <RecipeDetail
              recipe={selectedRecipe}
              onRate={handleRating}
              rating={ratings[selectedRecipe.id] || 0}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.has(selectedRecipe.id)}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Upload Food Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:bg-orange-50 dark:hover:bg-orange-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isProcessing}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                          <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {isProcessing ? "Analyzing..." : "Upload image"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop or click</p>
                        </div>
                      </div>
                    </div>

                    {successMessage && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm p-4 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3 animate-in fade-in slide-in-from-top">
                        <span className="text-lg flex-shrink-0">✓</span>
                        <div className="font-medium">{successMessage}</div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm p-4 rounded-lg border border-red-200 dark:border-red-800/50">
                        {error}
                      </div>
                    )}

                    {detectedIngredients.length > 0 && (
                      <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Detected Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {detectedIngredients.map((ingredient) => (
                            <div
                              key={ingredient}
                              className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-800"
                            >
                              {ingredient}
                              <button
                                onClick={() => {
                                  setDetectedIngredients(detectedIngredients.filter((i) => i !== ingredient))
                                }}
                                className="hover:opacity-70 transition-opacity ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-3">
              {detectedIngredients.length === 0 ? (
                <div className="text-center py-20 px-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full w-fit mx-auto mb-4">
                    <Upload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                    Upload a food image to discover matching recipes
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    Try uploading a clear photo of your ingredients
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Found{" "}
                      <span className="text-orange-600 dark:text-orange-400 text-lg">{matchedRecipes.length}</span>{" "}
                      recipe{matchedRecipes.length !== 1 ? "s" : ""} matching all your ingredients
                    </p>
                  </div>
                  {matchedRecipes.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {matchedRecipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          onClick={() => setSelectedRecipeId(recipe.id)}
                          className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
                        >
                          <RecipeCard
                            recipe={recipe}
                            isFavorite={favorites.has(recipe.id)}
                            onToggleFavorite={() => toggleFavorite(recipe.id)}
                            rating={ratings[recipe.id] || 0}
                            onRate={handleRating}
                            matchScore={recipe.matchScore}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <p className="text-slate-600 dark:text-slate-400">
                        No recipes found with only your detected ingredients.
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                        Try removing some ingredients or upload a different image.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
