"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Car, TrendingUp, Search, Bell, BarChart3 } from "lucide-react"
import Link from "next/link"
import { fetchSentiments } from "@/lib/api"

const popularBrands = [
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "Alfa Romeo",
  "Pagani",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Porsche",
  "McLaren",
]

interface RecentSearch {
  vehicle: string
  sentiment: "positive" | "negative" | "neutral"
  timestamp: Date
  sentimentScore: number
}

const STORAGE_KEY = "recent_analyses"
const MAX_RECENT_SEARCHES = 10

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const searches = JSON.parse(stored).map((search: any) => ({
          ...search,
          timestamp: new Date(search.timestamp)
        }))
        setRecentSearches(searches)
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }

  const saveRecentSearch = async (vehicle: string) => {
    try {
      const sentimentData = await fetchSentiments(10, vehicle)
      
      let sentiment: "positive" | "negative" | "neutral" = "neutral"
      let sentimentScore = 0
      
      if (sentimentData.length > 0) {
        const avgSentiment = sentimentData.reduce((acc, item) => acc + item.sentiment, 0) / sentimentData.length
        sentimentScore = Math.round((avgSentiment + 1) * 50)
        
        if (avgSentiment > 0.2) sentiment = "positive"
        else if (avgSentiment < -0.2) sentiment = "negative"
        else sentiment = "neutral"
      }

      const newSearch: RecentSearch = {
        vehicle,
        sentiment,
        timestamp: new Date(),
        sentimentScore
      }

      const updatedSearches = [
        newSearch,
        ...recentSearches.filter(search => search.vehicle !== vehicle)
      ].slice(0, MAX_RECENT_SEARCHES)

      setRecentSearches(updatedSearches)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const handleAnalysis = async () => {
    if (!searchInput && !selectedBrand) return

    setIsAnalyzing(true)
    const query = searchInput || selectedBrand
    
    await saveRecentSearch(query)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAnalyzing(false)

    window.location.href = `/report?vehicle=${encodeURIComponent(query)}`
  }

  const handleRecentSearchClick = (vehicle: string) => {
    window.location.href = `/report?vehicle=${encodeURIComponent(vehicle)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-red-800/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold text-white">Motor Valley Analytics</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/comparison" className="text-gray-300 hover:text-white transition-colors">
              <BarChart3 className="h-5 w-5" />
            </Link>
            <Link href="/notifications" className="text-gray-300 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Automotive Sentiment Intelligence</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Analyze public sentiment, trends, and insights for any vehicle or brand using advanced AI-powered data
            analysis
          </p>
        </div>

        {/* Main Analysis Card */}
        <Card className="max-w-2xl mx-auto mb-12 bg-black/40 border-red-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Start Your Analysis
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter a car name or select a brand to begin sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Car Name or Model</label>
              <Input
                placeholder="e.g., Ferrari SF90, Lamborghini Aventador..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Brand Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Or Select a Brand</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Choose a brand..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {popularBrands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="text-white hover:bg-slate-700">
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Analysis Button */}
            <Button
              onClick={handleAnalysis}
              disabled={(!searchInput && !selectedBrand) || isAnalyzing}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card className="max-w-2xl mx-auto bg-black/40 border-red-800/30">
          <CardHeader>
            <CardTitle className="text-white">Recent Analyses</CardTitle>
            <CardDescription className="text-gray-400">Quick access to previously analyzed vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearches.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent analyses yet</p>
                  <p className="text-sm">Start analyzing vehicles to see your search history</p>
                </div>
              ) : (
                recentSearches.map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleRecentSearchClick(search.vehicle)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {search.vehicle}
                      </div>
                      <div className="text-sm text-gray-400">
                        Last analyzed {formatTimeAgo(search.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {search.sentimentScore}%
                      </span>
                      <Badge
                        variant={
                          search.sentiment === "positive"
                            ? "default"
                            : search.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className={search.sentiment === "positive" ? "bg-green-600" : ""}
                      >
                        {search.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="bg-black/40 border-red-800/30 text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Sentiment Analysis</h3>
              <p className="text-gray-400 text-sm">Real-time sentiment tracking with explainable insights</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30 text-center">
            <CardContent className="pt-6">
              <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Brand Comparison</h3>
              <p className="text-gray-400 text-sm">Compare multiple brands and models side by side</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30 text-center">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Smart Alerts</h3>
              <p className="text-gray-400 text-sm">Get notified about significant sentiment changes</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
