"use client"

import { useState, useMemo } from "react"
import { RecipeDatabase } from "@/lib/recipe-database"
import { RecipeCard } from "@/components/recipe-card"
import { IngredientInput } from "@/components/ingredient-input"
import { FilterPanel } from "@/components/filter-panel"
import { FavoritesPanel } from "@/components/favorites-panel"
import { Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeDetail } from "@/components/recipe-detail"
import { WelcomePage } from "@/components/welcome-page"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([])
  const [filterCookTime, setFilterCookTime] = useState<{ min: number; max: number }>({ min: 0, max: 180 })
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  const recipes = RecipeDatabase.getRecipes()

  const matchedRecipes = useMemo(() => {
    return recipes
      .map((recipe) => {
        let matchScore = 0
        let matchedCount = 0

        selectedIngredients.forEach((selectedIng) => {
          const found = recipe.ingredients.some((recipeIng) => {
            const selected = selectedIng.toLowerCase()
            const recipeIngName = recipeIng.name.toLowerCase()
            return recipeIngName === selected || recipeIngName.includes(selected) || selected.includes(recipeIngName)
          })

          if (found) {
            matchedCount++
            matchScore += 100 / selectedIngredients.length
          }
        })

        const scorePercentage = selectedIngredients.length > 0 ? matchScore : 0

        return {
          ...recipe,
          matchScore: scorePercentage,
          matchedCount,
        }
      })
      .filter((recipe) => {
        if (selectedIngredients.length > 0 && recipe.matchedCount === 0) {
          return false
        }

        if (dietaryPreferences.length > 0) {
          const hasDietaryMatch = dietaryPreferences.every((pref) => recipe.dietary.includes(pref))
          if (!hasDietaryMatch) return false
        }

        if (filterDifficulty.length > 0 && !filterDifficulty.includes(recipe.difficulty)) {
          return false
        }

        if (recipe.cookTime < filterCookTime.min || recipe.cookTime > filterCookTime.max) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (selectedIngredients.length > 0) {
          return b.matchScore - a.matchScore
        }
        return 0
      })
  }, [selectedIngredients, dietaryPreferences, filterDifficulty, filterCookTime])

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {showWelcome ? (
        <WelcomePage onGetStarted={() => setShowWelcome(false)} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="favorites" className="flex gap-2">
                <Heart className="w-4 h-4" />
                Favorites ({favorites.size})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-8">
              {selectedRecipe ? (
                <div>
                  <button
                    onClick={() => setSelectedRecipeId(null)}
                    className="mb-6 text-primary hover:underline font-medium flex items-center gap-2 transition-colors"
                  >
                    ← Back to recipes
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
                    <div className="sticky top-24 space-y-6">
                      <IngredientInput
                        selectedIngredients={selectedIngredients}
                        onIngredientsChange={setSelectedIngredients}
                        allIngredients={RecipeDatabase.getAllIngredients()}
                      />

                      <FilterPanel
                        dietaryPreferences={dietaryPreferences}
                        onDietaryChange={setDietaryPreferences}
                        filterDifficulty={filterDifficulty}
                        onDifficultyChange={setFilterDifficulty}
                        filterCookTime={filterCookTime}
                        onCookTimeChange={setFilterCookTime}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    {matchedRecipes.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg mb-4">
                          {selectedIngredients.length === 0
                            ? "Upload a photo or select ingredients to discover recipes"
                            : "No recipes match your criteria. Try adjusting your filters."}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <p className="text-sm font-semibold text-foreground">
                            Found {matchedRecipes.length} recipe{matchedRecipes.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          {matchedRecipes.map((recipe) => (
                            <div
                              key={recipe.id}
                              onClick={() => setSelectedRecipeId(recipe.id)}
                              className="cursor-pointer transition-transform hover:scale-105"
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
                      </>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              <FavoritesPanel
                recipes={recipes}
                favorites={favorites}
                ratings={ratings}
                onToggleFavorite={toggleFavorite}
                onRate={handleRating}
                onSelectRecipe={setSelectedRecipeId}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
