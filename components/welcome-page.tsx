"use client"
import { Button } from "@/components/ui/button"
import { ChefHat, Upload, Filter, Heart, Zap, Clock } from "lucide-react"
import Link from "next/link"

interface WelcomePageProps {
  onGetStarted: () => void
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <ChefHat className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">RecipeGenius</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <p className="text-sm font-semibold text-accent">Powered by AI</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">
                Discover Your Next Favorite Recipe
              </h2>
              <p className="text-lg text-muted-foreground text-balance leading-relaxed">
                Upload a photo or select ingredients you have. Our intelligent recipe engine finds the perfect dishes
                customized to your dietary preferences and cooking time.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg rounded-lg transition-all hover:shadow-lg hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Exploring
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-lg border-2 bg-transparent">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <p className="text-2xl font-bold text-accent">25+</p>
                <p className="text-sm text-muted-foreground">Recipes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">10+</p>
                <p className="text-sm text-muted-foreground">Cuisines</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">∞</p>
                <p className="text-sm text-muted-foreground">Combinations</p>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Feature Card 1 */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:border-accent transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:bg-accent/20 transition-all">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Image Recognition</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Snap a photo of your ingredients and let AI identify them instantly
              </p>
              <Link href="/image-upload">
                <Button variant="secondary" size="sm" className="w-full">
                  Upload Image
                </Button>
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:border-accent transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:bg-accent/20 transition-all">
                <Filter className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Smart Filtering</h3>
              <p className="text-sm text-muted-foreground">
                Filter by dietary restrictions, cooking time, and difficulty level
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:border-accent transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4 group-hover:bg-accent/20 transition-all">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Save Favorites</h3>
              <p className="text-sm text-muted-foreground">Rate and bookmark recipes you love for quick access later</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Instant Matches</h4>
            <p className="text-muted-foreground text-sm">Get recipe suggestions instantly based on what you have</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Save Time</h4>
            <p className="text-muted-foreground text-sm">
              Find recipes that fit your schedule with cooking time filters
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <ChefHat className="w-6 h-6 text-accent" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Professional Recipes</h4>
            <p className="text-muted-foreground text-sm">Access 25+ curated recipes with nutritional information</p>
          </div>
        </div>
      </section>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
