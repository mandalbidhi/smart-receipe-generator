"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface FilterPanelProps {
  dietaryPreferences: string[]
  onDietaryChange: (preferences: string[]) => void
  filterDifficulty: string[]
  onDifficultyChange: (difficulty: string[]) => void
  filterCookTime: { min: number; max: number }
  onCookTimeChange: (time: { min: number; max: number }) => void
}

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto"]
const difficultyLevels = ["Easy", "Medium", "Hard"]

export function FilterPanel({
  dietaryPreferences,
  onDietaryChange,
  filterDifficulty,
  onDifficultyChange,
  filterCookTime,
  onCookTimeChange,
}: FilterPanelProps) {
  const toggleDietary = (pref: string) => {
    onDietaryChange(
      dietaryPreferences.includes(pref) ? dietaryPreferences.filter((p) => p !== pref) : [...dietaryPreferences, pref],
    )
  }

  const toggleDifficulty = (diff: string) => {
    onDifficultyChange(
      filterDifficulty.includes(diff) ? filterDifficulty.filter((d) => d !== diff) : [...filterDifficulty, diff],
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dietary Preferences */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-foreground">Dietary</h3>
          <div className="space-y-2">
            {dietaryOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`dietary-${option}`}
                  checked={dietaryPreferences.includes(option)}
                  onCheckedChange={() => toggleDietary(option)}
                />
                <Label htmlFor={`dietary-${option}`} className="text-sm cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-foreground">Difficulty</h3>
          <div className="space-y-2">
            {difficultyLevels.map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`difficulty-${level}`}
                  checked={filterDifficulty.includes(level)}
                  onCheckedChange={() => toggleDifficulty(level)}
                />
                <Label htmlFor={`difficulty-${level}`} className="text-sm cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Time */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-foreground">Cooking Time</h3>
          <div className="space-y-4">
            <Slider
              value={[filterCookTime.min, filterCookTime.max]}
              onValueChange={([min, max]) => onCookTimeChange({ min, max })}
              min={0}
              max={180}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filterCookTime.min} min</span>
              <span>{filterCookTime.max} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
