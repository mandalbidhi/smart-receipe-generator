"use client"

import { Button } from "@/components/ui/button"
import { Heart, Clock, ChefHat, Flame } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Recipe } from "@/lib/recipe-database"

interface RecipeDetailProps {
  recipe: Recipe & { matchScore?: number }
  onClose?: () => void
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
  onRate?: (recipeId: string, rating: number) => void
  rating?: number
}

export function RecipeDetail({
  recipe,
  onClose,
  onToggleFavorite,
  isFavorite = false,
  onRate,
  rating = 0,
}: RecipeDetailProps) {
  const getSubstitutions = (ingredientName: string): string[] => {
    if (recipe.substitutions && recipe.substitutions[ingredientName]) {
      return recipe.substitutions[ingredientName]
    }
    return []
  }

  return (
    <div className="w-full bg-background rounded-lg border border-border">
      <div className="sticky top-0 bg-background border-b border-border z-10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
          {onToggleFavorite && (
            <Button variant="ghost" size="sm" onClick={() => onToggleFavorite(recipe.id)}>
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] w-full">
        <div className="space-y-6 p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{recipe.cookTime} min</p>
              <p className="text-xs text-muted-foreground">Cook Time</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <ChefHat className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium capitalize">{recipe.difficulty}</p>
              <p className="text-xs text-muted-foreground">Difficulty</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Flame className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{recipe.calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">{recipe.protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
          </div>

          {(recipe.carbs || recipe.fat) && (
            <div className="grid grid-cols-3 gap-4">
              {recipe.carbs && (
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">{recipe.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
              )}
              {recipe.fat && (
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">{recipe.fat}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              )}
              {recipe.servings && (
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">{recipe.servings}</p>
                  <p className="text-xs text-muted-foreground">Servings</p>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => {
                const substitutions = getSubstitutions(ing.name)
                return (
                  <div key={idx} className="p-3 bg-muted rounded">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{ing.name}</p>
                        <p className="text-sm text-muted-foreground">{ing.amount}</p>
                        {ing.category && (
                          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {ing.category}
                          </span>
                        )}
                      </div>
                      <input type="checkbox" className="w-4 h-4 mt-1" />
                    </div>
                    {substitutions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Substitutions:</p>
                        <div className="flex flex-wrap gap-2">
                          {substitutions.map((sub) => (
                            <span
                              key={sub}
                              className="text-xs bg-background text-foreground px-2 py-1 rounded border border-muted-foreground/20"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Instructions</h3>
            <div className="space-y-3">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <p className="text-sm pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {onRate && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-3">Rate this recipe</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate(recipe.id, star)}
                    className="transition-transform hover:scale-110 text-2xl"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recipe.dietary.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary.map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
