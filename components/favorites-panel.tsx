"use client"

import { RecipeCard } from "./recipe-card"
import { Card } from "@/components/ui/card"

interface Recipe {
  id: string
  name: string
  description: string
  difficulty: string
  cookTime: number
  servings: number
  calories: number
  protein: number
  ingredients: Array<{ name: string; amount: string }>
  steps: string[]
  dietary: string[]
}

interface FavoritesPanelProps {
  recipes: Recipe[]
  favorites: Set<string>
  ratings: Record<string, number>
  onToggleFavorite: (id: string) => void
  onRate: (id: string, rating: number) => void
}

export function FavoritesPanel({ recipes, favorites, ratings, onToggleFavorite, onRate }: FavoritesPanelProps) {
  const favoriteRecipes = recipes.filter((r) => favorites.has(r.id))

  if (favoriteRecipes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No favorite recipes yet</p>
        <p className="text-sm text-muted-foreground mt-2">Add recipes to your favorites to see them here</p>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favoriteRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={{
            ...recipe,
            matchScore: 0,
            matchedCount: 0,
          }}
          isFavorite={favorites.has(recipe.id)}
          onToggleFavorite={onToggleFavorite}
          rating={ratings[recipe.id] || 0}
          onRate={onRate}
          matchScore={0}
        />
      ))}
    </div>
  )
}
