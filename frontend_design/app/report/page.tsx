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
import { generateJSONExport, generatePDFExport, copyToClipboard } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"
import { ForumSentimentCard, EngagementSentimentCard } from "@/components/sentiment-trend-cards"
import { fetchSentiments, fetchEngagements, calculateAverageSentiment, calculateAverageEngagement } from "@/lib/api"
import type { SentimentData, EngagementData } from "@/lib/api"

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

const getVehicleSpecificInsights = (vehicle: string, sentimentData: SentimentData[], engagementData: EngagementData[]) => {
  const totalSources = sentimentData.length + engagementData.length
  const avgSentiment = calculateAverageSentiment(sentimentData)
  const avgEngagement = calculateAverageEngagement(engagementData)
  
  if (vehicle.toLowerCase().includes("ferrari")) {
    return [
      {
        title: "Performance Excellence",
        description: "Outstanding acceleration and track performance consistently praised",
        sentiment: avgSentiment > 0.1 ? "positive" : avgSentiment < -0.1 ? "negative" : "neutral",
        impact: "high",
        sources: Math.floor(totalSources * 0.4),
      },
      {
        title: "Premium Pricing",
        description: "High purchase and maintenance costs frequently mentioned",
        sentiment: "negative",
        impact: "medium",
        sources: Math.floor(totalSources * 0.25),
      },
      {
        title: "Iconic Design",
        description: "Classic Ferrari styling receives widespread admiration",
        sentiment: "positive",
        impact: "high",
        sources: Math.floor(totalSources * 0.35),
      },
    ]
  } else if (vehicle.toLowerCase().includes("bmw")) {
    return [
      {
        title: "Driving Dynamics",
        description: "Exceptional handling and driving experience highlighted",
        sentiment: avgSentiment > 0.1 ? "positive" : avgSentiment < -0.1 ? "negative" : "neutral",
        impact: "high",
        sources: Math.floor(totalSources * 0.45),
      },
      {
        title: "Technology Integration",
        description: "Advanced tech features and infotainment system praised",
        sentiment: "positive",
        impact: "medium",
        sources: Math.floor(totalSources * 0.3),
      },
      {
        title: "Maintenance Costs",
        description: "Service and repair expenses are a common concern",
        sentiment: "negative",
        impact: "medium",
        sources: Math.floor(totalSources * 0.25),
      },
    ]
  } else if (vehicle.toLowerCase().includes("lamborghini")) {
    return [
      {
        title: "Exotic Appeal",
        description: "Dramatic styling and exclusivity highly appreciated",
        sentiment: avgSentiment > 0.1 ? "positive" : avgSentiment < -0.1 ? "negative" : "neutral",
        impact: "high",
        sources: Math.floor(totalSources * 0.5),
      },
      {
        title: "Performance Power",
        description: "Incredible acceleration and top speed capabilities",
        sentiment: "positive",
        impact: "high",
        sources: Math.floor(totalSources * 0.3),
      },
      {
        title: "Practicality Concerns",
        description: "Daily usability and comfort limitations noted",
        sentiment: "neutral",
        impact: "medium",
        sources: Math.floor(totalSources * 0.2),
      },
    ]
  } else {
    return [
      {
        title: "Performance Analysis",
        description: "Vehicle performance characteristics under review",
        sentiment: avgSentiment > 0.1 ? "positive" : avgSentiment < -0.1 ? "negative" : "neutral",
        impact: "medium",
        sources: Math.floor(totalSources * 0.4),
      },
      {
        title: "Market Position",
        description: "Competitive positioning and value proposition",
        sentiment: "neutral",
        impact: "medium",
        sources: Math.floor(totalSources * 0.35),
      },
      {
        title: "User Feedback",
        description: "General user experiences and opinions",
        sentiment: avgSentiment > 0 ? "positive" : "negative",
        impact: "medium",
        sources: Math.floor(totalSources * 0.25),
      },
    ]
  }
}

export default function ReportPage() {
  const searchParams = useSearchParams()
  const vehicle = searchParams.get("vehicle") || "Ferrari SF90"
  const [currentSentiment, setCurrentSentiment] = useState(85)
  const [totalMentions, setTotalMentions] = useState(0)
  const [averageEngagement, setAverageEngagement] = useState(0)
  const [trendDirection, setTrendDirection] = useState("Positive")
  const [riskLevel, setRiskLevel] = useState("Low")
  const [keyInsights, setKeyInsights] = useState<any[]>([])
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [droppedInsights, setDroppedInsights] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [fetchedSentimentData, fetchedEngagementData] = await Promise.all([
          fetchSentiments(100, vehicle || undefined),
          fetchEngagements(vehicle || undefined)
        ])

        setSentimentData(fetchedSentimentData)
        setEngagementData(fetchedEngagementData)

        if (fetchedSentimentData.length > 0) {
          const avgSentiment = calculateAverageSentiment(fetchedSentimentData)
          const sentimentPercentage = Math.round((avgSentiment + 1) * 50)
          setCurrentSentiment(sentimentPercentage)
          setTotalMentions(fetchedSentimentData.length)
          
          if (avgSentiment > 0.2) {
            setTrendDirection("Positive")
            setRiskLevel("Low")
          } else if (avgSentiment < -0.2) {
            setTrendDirection("Negative") 
            setRiskLevel("High")
          } else {
            setTrendDirection("Neutral")
            setRiskLevel("Medium")
          }
        }

        if (fetchedEngagementData.length > 0) {
          const avgEngagement = calculateAverageEngagement(fetchedEngagementData)
          setAverageEngagement(avgEngagement)
        }

        const vehicleInsights = getVehicleSpecificInsights(vehicle, fetchedSentimentData, fetchedEngagementData)
        setKeyInsights(vehicleInsights)

      } catch (error) {
        console.error('Error loading overview data:', error)
      } finally {
        setTimeout(() => setIsLoading(false), 1500)
      }
    }

    loadOverviewData()
  }, [vehicle])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = generateJSONExport(
        vehicle,
        currentSentiment,
        [],
        sourceData,
        keyInsights,
        messages,
        droppedInsights
      )

      await generatePDFExport(exportData)
      toast({
        title: "Export Successful", 
        description: "PDF report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const currentUrl = window.location.href
    const success = await copyToClipboard(currentUrl)
    
    if (success) {
      toast({
        title: "Link Copied",
        description: "Report link has been copied to clipboard.",
      })
    } else {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please copy the URL manually.",
        variant: "destructive",
      })
    }
  }

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
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-600 bg-transparent text-white hover:bg-red-600/20 hover:text-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-600 bg-transparent text-white hover:bg-red-600/20 hover:text-white"
              disabled={isExporting}
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
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
                  <p className="text-3xl font-bold text-white">{totalMentions.toLocaleString()}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm text-gray-400 mt-2">Forum comments analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Trend Direction</p>
                  <p className={`text-xl font-bold ${
                    trendDirection === "Positive" ? "text-green-400" : 
                    trendDirection === "Negative" ? "text-red-400" : "text-gray-400"
                  }`}>{trendDirection}</p>
                </div>
                {trendDirection === "Positive" ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : trendDirection === "Negative" ? (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-500"></div>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-2">Based on sentiment analysis</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Risk Level</p>
                  <p className={`text-xl font-bold ${
                    riskLevel === "Low" ? "text-green-400" : 
                    riskLevel === "High" ? "text-red-400" : "text-yellow-400"
                  }`}>{riskLevel}</p>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  riskLevel === "Low" ? "bg-green-400/20" : 
                  riskLevel === "High" ? "bg-red-400/20" : "bg-yellow-400/20"
                }`}>
                  <div className={`h-4 w-4 rounded-full ${
                    riskLevel === "Low" ? "bg-green-400" : 
                    riskLevel === "High" ? "bg-red-400" : "bg-yellow-400"
                  }`}></div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {riskLevel === "Low" ? "Reputation stable" : 
                 riskLevel === "High" ? "Reputation at risk" : "Reputation monitoring"}
              </p>
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
              <ForumSentimentCard />
              <EngagementSentimentCard />
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
            <DragDropInterface 
              vehicle={vehicle} 
              insights={keyInsights}
              onMessagesChange={setMessages}
              onDroppedInsightsChange={setDroppedInsights}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
