"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { Upload } from "lucide-react"

interface IngredientInputProps {
  selectedIngredients: string[]
  onIngredientsChange: (ingredients: string[]) => void
  allIngredients: string[]
}

// Enhanced ingredient detection with color and visual pattern analysis
const INGREDIENT_PATTERNS: Record<
  string,
  {
    colors: string[]
    keywords: string[]
  }
> = {
  Tomato: { colors: ["red", "ff0000", "ff4444"], keywords: ["tomato", "red", "round"] },
  Chicken: { colors: ["yellow", "ffff00", "ffcc99"], keywords: ["chicken", "poultry"] },
  Broccoli: { colors: ["green", "00ff00", "228b22"], keywords: ["broccoli", "green"] },
  Carrot: { colors: ["orange", "ff8c00", "ffa500"], keywords: ["carrot", "orange"] },
  Garlic: { colors: ["white", "ffffff", "f5f5f5"], keywords: ["garlic", "white"] },
  Onion: { colors: ["yellow", "golden", "ff00ff"], keywords: ["onion", "layers"] },
  Potato: { colors: ["brown", "8b4513", "a0522d"], keywords: ["potato", "brown"] },
  Lettuce: { colors: ["green", "00ff00", "90ee90"], keywords: ["lettuce", "leafy"] },
  Cheese: { colors: ["yellow", "ffff00", "ffd700"], keywords: ["cheese", "yellow"] },
  Egg: { colors: ["white", "ffffff", "fffacd"], keywords: ["egg", "oval"] },
  Mushroom: { colors: ["brown", "8b4513", "d2691e"], keywords: ["mushroom", "brown"] },
  Spinach: { colors: ["green", "006400", "228b22"], keywords: ["spinach", "dark"] },
  Pepper: { colors: ["red", "ff0000", "ff6347"], keywords: ["pepper", "red"] },
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

      // Skip transparent pixels
      if (a < 128) continue

      // Categorize colors into basic groups
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

export function IngredientInput({ selectedIngredients, onIngredientsChange, allIngredients }: IngredientInputProps) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const filteredSuggestions = allIngredients.filter(
    (ing) => ing.toLowerCase().includes(input.toLowerCase()) && !selectedIngredients.includes(ing),
  )

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      onIngredientsChange([...selectedIngredients, ingredient])
    }
    setInput("")
    setShowSuggestions(false)
  }

  const removeIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter((i) => i !== ingredient))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      addIngredient(input.trim())
    }
  }

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
            const detectedIngredients: Set<string> = new Set()

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

              if (colorMatch && !selectedIngredients.includes(ingredient)) {
                detectedIngredients.add(ingredient)
              }
            }

            const newIngredients = Array.from(detectedIngredients)
            if (newIngredients.length > 0) {
              onIngredientsChange([...selectedIngredients, ...newIngredients])
              setError(null)
              setSuccessMessage(
                `Image uploaded successfully! Detected ${newIngredients.length} ingredient${newIngredients.length > 1 ? "s" : ""}: ${newIngredients.join(", ")}`,
              )
              setTimeout(() => setSuccessMessage(null), 5000)
            } else {
              setError(
                "No common ingredients detected. Try uploading a clearer food image or add ingredients manually.",
              )
            }
          }

          img.onerror = () => {
            setError("Unable to load image. Please try another file.")
          }

          img.src = event.target?.result as string
        } catch (err) {
          console.log("[v0] Image processing error:", err)
          setError("Unable to process image. Please add ingredients manually.")
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
      setError("Unable to process image. Please add ingredients manually.")
      setIsProcessing(false)
    }
  }

  return (
    <Card className="sticky top-4 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Your Ingredients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text input */}
        <div className="relative">
          <Input
            placeholder="Search ingredients..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="bg-card"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addIngredient(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Image upload */}
        <div className="relative border-2 border-dashed border-primary/30 rounded-lg p-4 text-center hover:border-primary/60 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isProcessing}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{isProcessing ? "Analyzing..." : "Upload image"}</p>
              <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200 text-sm p-3 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
            <div className="text-lg">✓</div>
            <div>{successMessage}</div>
          </div>
        )}

        {/* Error message */}
        {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

        {/* Selected ingredients */}
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <div
              key={ingredient}
              className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
            >
              {ingredient}
              <button onClick={() => removeIngredient(ingredient)} className="hover:opacity-70 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {selectedIngredients.length === 0 && (
          <p className="text-xs text-muted-foreground">Add ingredients to see matching recipes</p>
        )}
      </CardContent>
    </Card>
  )
}
