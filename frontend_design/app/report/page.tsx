"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, MessageSquare, Share2, Download, Car, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DragDropInterface } from "@/components/drag-drop-interface"

const sentimentData = [
  { month: "Jan", sentiment: 75, mentions: 1200 },
  { month: "Feb", sentiment: 78, mentions: 1350 },
  { month: "Mar", sentiment: 72, mentions: 1100 },
  { month: "Apr", sentiment: 85, mentions: 1800 },
  { month: "May", sentiment: 82, mentions: 1650 },
  { month: "Jun", sentiment: 88, mentions: 2100 },
]

const sourceData = [
  { name: "Social Media", value: 45, color: "#ef4444" },
  { name: "News Articles", value: 30, color: "#f97316" },
  { name: "Forums", value: 15, color: "#eab308" },
  { name: "Reviews", value: 10, color: "#22c55e" },
]

const keyInsights = [
  {
    title: "Performance Praise",
    description: "Exceptional acceleration and handling consistently mentioned",
    sentiment: "positive",
    impact: "high",
    sources: 847,
  },
  {
    title: "Price Concerns",
    description: "High maintenance costs frequently discussed",
    sentiment: "negative",
    impact: "medium",
    sources: 423,
  },
  {
    title: "Design Appeal",
    description: "Aesthetic design receives widespread appreciation",
    sentiment: "positive",
    impact: "high",
    sources: 692,
  },
  {
    title: "Reliability Questions",
    description: "Some concerns about long-term reliability",
    sentiment: "neutral",
    impact: "medium",
    sources: 234,
  },
]

export default function ReportPage() {
  const searchParams = useSearchParams()
  const vehicle = searchParams.get("vehicle") || "Ferrari SF90"
  const [currentSentiment] = useState(85)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing {vehicle}</h2>
          <p className="text-gray-400">Scraping data from multiple sources...</p>
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <div>✓ Social media platforms</div>
            <div>✓ News articles and reviews</div>
            <div>✓ Automotive forums</div>
            <div className="animate-pulse">⏳ Processing sentiment data...</div>
          </div>
        </div>
      </div>
    )
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
              <span className="text-xl font-bold text-white">{vehicle} Report</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-red-800 text-white hover:bg-red-800/20">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="border-red-800 text-white hover:bg-red-800/20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Current Sentiment</p>
                  <p className="text-3xl font-bold text-white">{currentSentiment}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={currentSentiment} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Mentions</p>
                  <p className="text-3xl font-bold text-white">9,250</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm text-green-400 mt-2">+15% vs last month</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Trend Direction</p>
                  <p className="text-xl font-bold text-green-400">Positive</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-gray-400 mt-2">6-month trend</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Risk Level</p>
                  <p className="text-xl font-bold text-yellow-400">Low</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">Reputation stable</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border-red-800/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-red-600">
              Key Insights
            </TabsTrigger>
            <TabsTrigger value="explainability" className="data-[state=active]:bg-red-600">
              Explainability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sentiment Trend */}
              <Card className="bg-black/40 border-red-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Sentiment Trend (6 Months)</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sentiment score over time with mention volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentData}>
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
                      <Line type="monotone" dataKey="sentiment" stroke="#EF4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card className="bg-black/40 border-red-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Data Sources</CardTitle>
                  <CardDescription className="text-gray-400">Distribution of mentions across platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-4">
              {keyInsights.map((insight, index) => (
                <Card key={index} className="bg-black/40 border-red-800/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                          <Badge
                            variant={
                              insight.sentiment === "positive"
                                ? "default"
                                : insight.sentiment === "negative"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={insight.sentiment === "positive" ? "bg-green-600" : ""}
                          >
                            {insight.sentiment}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-gray-400 mb-3">{insight.description}</p>
                        <p className="text-sm text-gray-500">{insight.sources} sources analyzed</p>
                      </div>
                      <div className="ml-4">
                        {insight.sentiment === "positive" ? (
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        ) : insight.sentiment === "negative" ? (
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-500"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="explainability">
            <DragDropInterface vehicle={vehicle} insights={keyInsights} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
