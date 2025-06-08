"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Car, ArrowLeft, Plus, X, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

const availableBrands = [
  "Ferrari",
  "Lamborghini",
  "McLaren",
  "Porsche",
  "Aston Martin",
  "Bugatti",
  "Koenigsegg",
  "Pagani",
  "BMW",
  "Mercedes-AMG",
]

const mockData = {
  Ferrari: {
    sentiment: 85,
    trend: "positive",
    data: [
      { month: "Jan", sentiment: 75 },
      { month: "Feb", sentiment: 78 },
      { month: "Mar", sentiment: 72 },
      { month: "Apr", sentiment: 85 },
      { month: "May", sentiment: 82 },
      { month: "Jun", sentiment: 88 },
    ],
    color: "#ef4444",
  },
  Lamborghini: {
    sentiment: 82,
    trend: "positive",
    data: [
      { month: "Jan", sentiment: 78 },
      { month: "Feb", sentiment: 80 },
      { month: "Mar", sentiment: 75 },
      { month: "Apr", sentiment: 83 },
      { month: "May", sentiment: 85 },
      { month: "Jun", sentiment: 82 },
    ],
    color: "#f97316",
  },
  McLaren: {
    sentiment: 79,
    trend: "neutral",
    data: [
      { month: "Jan", sentiment: 82 },
      { month: "Feb", sentiment: 78 },
      { month: "Mar", sentiment: 80 },
      { month: "Apr", sentiment: 77 },
      { month: "May", sentiment: 79 },
      { month: "Jun", sentiment: 79 },
    ],
    color: "#eab308",
  },
  Porsche: {
    sentiment: 88,
    trend: "positive",
    data: [
      { month: "Jan", sentiment: 85 },
      { month: "Feb", sentiment: 87 },
      { month: "Mar", sentiment: 84 },
      { month: "Apr", sentiment: 89 },
      { month: "May", sentiment: 90 },
      { month: "Jun", sentiment: 88 },
    ],
    color: "#22c55e",
  },
}

export default function ComparisonPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>(["Ferrari", "Lamborghini"])
  const [newBrand, setNewBrand] = useState("")

  const addBrand = () => {
    if (newBrand && !selectedBrands.includes(newBrand) && selectedBrands.length < 4) {
      setSelectedBrands([...selectedBrands, newBrand])
      setNewBrand("")
    }
  }

  const removeBrand = (brand: string) => {
    setSelectedBrands(selectedBrands.filter((b) => b !== brand))
  }

  const getComparisonData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month) => {
      const dataPoint: any = { month }
      selectedBrands.forEach((brand) => {
        if (mockData[brand as keyof typeof mockData]) {
          const brandData = mockData[brand as keyof typeof mockData].data.find((d) => d.month === month)
          dataPoint[brand] = brandData?.sentiment || 0
        }
      })
      return dataPoint
    })
  }

  const getBarData = () => {
    return selectedBrands.map((brand) => ({
      brand,
      sentiment: mockData[brand as keyof typeof mockData]?.sentiment || 0,
      color: mockData[brand as keyof typeof mockData]?.color || "#6b7280",
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-red-800/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold text-white">Brand Comparison</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Brand Selection */}
        <Card className="mb-8 bg-black/40 border-red-800/30">
          <CardHeader>
            <CardTitle className="text-white">Select Brands to Compare</CardTitle>
            <CardDescription className="text-gray-400">
              Compare sentiment trends across multiple automotive brands (max 4)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {selectedBrands.map((brand) => (
                <div key={brand} className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-white">{brand}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBrand(brand)}
                    className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {selectedBrands.length < 4 && (
              <div className="flex gap-2">
                <Select value={newBrand} onValueChange={setNewBrand}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Add a brand..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {availableBrands
                      .filter((brand) => !selectedBrands.includes(brand))
                      .map((brand) => (
                        <SelectItem key={brand} value={brand} className="text-white hover:bg-slate-700">
                          {brand}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={addBrand} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedBrands.map((brand) => {
            const brandData = mockData[brand as keyof typeof mockData]
            return (
              <Card key={brand} className="bg-black/40 border-red-800/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{brand}</h3>
                    {brandData?.trend === "positive" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : brandData?.trend === "negative" ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-gray-500"></div>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{brandData?.sentiment || 0}%</div>
                  <Badge
                    variant={
                      brandData?.trend === "positive"
                        ? "default"
                        : brandData?.trend === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className={brandData?.trend === "positive" ? "bg-green-600" : ""}
                  >
                    {brandData?.trend || "neutral"}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend Comparison */}
          <Card className="bg-black/40 border-red-800/30">
            <CardHeader>
              <CardTitle className="text-white">Sentiment Trends</CardTitle>
              <CardDescription className="text-gray-400">
                6-month sentiment comparison across selected brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  {selectedBrands.map((brand) => (
                    <Line
                      key={brand}
                      type="monotone"
                      dataKey={brand}
                      stroke={mockData[brand as keyof typeof mockData]?.color || "#6b7280"}
                      strokeWidth={3}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current Sentiment Comparison */}
          <Card className="bg-black/40 border-red-800/30">
            <CardHeader>
              <CardTitle className="text-white">Current Sentiment Scores</CardTitle>
              <CardDescription className="text-gray-400">Latest sentiment scores comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="brand" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Bar dataKey="sentiment" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="mt-6 bg-black/40 border-red-800/30">
          <CardHeader>
            <CardTitle className="text-white">Comparison Insights</CardTitle>
            <CardDescription className="text-gray-400">Key findings from the brand comparison analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Highest Performer</h4>
                <p className="text-gray-400">
                  {selectedBrands.length > 0 &&
                    `${selectedBrands.reduce((prev, current) =>
                      (mockData[prev as keyof typeof mockData]?.sentiment || 0) >
                      (mockData[current as keyof typeof mockData]?.sentiment || 0)
                        ? prev
                        : current,
                    )} leads with the highest sentiment score, showing strong positive reception across all platforms.`}
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Trend Analysis</h4>
                <p className="text-gray-400">
                  Most brands show positive sentiment trends over the past 6 months, with performance and design being
                  key drivers of positive sentiment across the luxury automotive segment.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Market Position</h4>
                <p className="text-gray-400">
                  The comparison reveals distinct positioning strategies, with some brands focusing on heritage and
                  exclusivity while others emphasize innovation and performance metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
