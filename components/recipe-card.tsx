"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Clock, ChefHat, Flame } from "lucide-react"
import { RecipeDetail } from "./recipe-detail"

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

interface RecipeCardProps {
  recipe: Recipe & { matchScore: number; matchedCount: number }
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  rating: number
  onRate: (id: string, rating: number) => void
  matchScore: number
}

export function RecipeCard({ recipe, isFavorite, onToggleFavorite, rating, onRate, matchScore }: RecipeCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2">{recipe.name}</CardTitle>
              <CardDescription className="line-clamp-1 mt-1">{recipe.description}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onToggleFavorite(recipe.id)} className="flex-shrink-0">
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </Button>
          </div>

          {matchScore > 0 && (
            <div className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded w-fit font-medium">
              {matchScore.toFixed(0)}% match ({recipe.matchedCount} ingredients)
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-muted-foreground" />
              <span>{recipe.calories} cal</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{recipe.protein}g</span> protein
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-2">
            {recipe.dietary.map((tag) => (
              <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRate(recipe.id, star)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {star <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setShowDetail(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            View Recipe
          </Button>
        </CardContent>
      </Card>

      {showDetail && (
        <RecipeDetail
          recipe={recipe}
          onClose={() => setShowDetail(false)}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          onRate={onRate}
          rating={rating}
        />
      )}
    </>
  )
}
