"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, MessageSquare, Activity } from "lucide-react"
import { fetchSentiments, fetchEngagements, calculateAverageSentiment, calculateSentimentPercentage, calculateAverageEngagement } from "@/lib/api"
import type { SentimentData, EngagementData } from "@/lib/api"

export function ForumSentimentCard() {
  const [sentiments, setSentiments] = useState<SentimentData[]>([])
  const [loading, setLoading] = useState(true)
  const [averageSentiment, setAverageSentiment] = useState(0)
  const [sentimentBreakdown, setSentimentBreakdown] = useState({ positive: 0, neutral: 0, negative: 0 })
  
  const searchParams = useSearchParams()
  const vehicle = searchParams.get("vehicle")

  useEffect(() => {
    const loadSentiments = async () => {
      try {
        console.log('Loading sentiments for vehicle:', vehicle)
        const data = await fetchSentiments(100, vehicle || undefined)
        setSentiments(data)
        
        const avg = calculateAverageSentiment(data)
        setAverageSentiment(avg)
        
        const breakdown = calculateSentimentPercentage(data)
        setSentimentBreakdown(breakdown)
      } catch (error) {
        console.error('Error loading sentiment data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSentiments()
  }, [vehicle])

  const chartData = sentiments.slice(0, 6).map((item, index) => ({
    name: `Point ${index + 1}`,
    sentiment: Math.round((item.sentiment + 1) * 50),
    date: new Date(item.created_at).toLocaleDateString()
  }))

  const sentimentPercentage = Math.round((averageSentiment + 1) * 50)

  if (loading) {
    return (
      <Card className="bg-black/40 border-red-800/30">
        <CardHeader>
          <CardTitle className="text-white">Forum Sentiment Trend</CardTitle>
          <CardDescription className="text-gray-400">Loading forum sentiment data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 border-red-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Forum Sentiment Trend
          {vehicle && <span className="text-sm text-gray-400">({vehicle})</span>}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Sentiment analysis from automotive forums and discussions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Overall Forum Sentiment</p>
            <p className="text-2xl font-bold text-white">{sentimentPercentage}%</p>
          </div>
          {averageSentiment > 0 ? (
            <TrendingUp className="h-6 w-6 text-green-500" />
          ) : averageSentiment < 0 ? (
            <TrendingDown className="h-6 w-6 text-red-500" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-500"></div>
          )}
        </div>
        
        <Progress value={sentimentPercentage} className="h-2" />

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <p className="text-green-400 font-semibold">{sentimentBreakdown.positive}%</p>
            <p className="text-gray-500">Positive</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 font-semibold">{sentimentBreakdown.neutral}%</p>
            <p className="text-gray-500">Neutral</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-semibold">{sentimentBreakdown.negative}%</p>
            <p className="text-gray-500">Negative</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Based on {sentiments.length} forum comments and discussions
          {vehicle && ` about ${vehicle}`}
        </p>
      </CardContent>
    </Card>
  )
}

export function EngagementSentimentCard() {
  const [engagements, setEngagements] = useState<EngagementData[]>([])
  const [loading, setLoading] = useState(true)
  const [averageEngagement, setAverageEngagement] = useState(0)
  
  const searchParams = useSearchParams()
  const vehicle = searchParams.get("vehicle")

  useEffect(() => {
    const loadEngagements = async () => {
      try {
        console.log('Loading engagements for vehicle:', vehicle)
        const data = await fetchEngagements(vehicle || undefined)
        setEngagements(data)
        
        if (data.length > 0) {
          const avg = calculateAverageEngagement(data)
          setAverageEngagement(avg)
        }
      } catch (error) {
        console.error('Error loading engagement data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEngagements()
  }, [vehicle])

  const chartData = engagements.map((item, index) => ({
    name: `${item.platform} ${index + 1}`,
    engagement: item.engagement,
    date: new Date(item.created_at).toLocaleDateString()
  }))

  if (loading) {
    return (
      <Card className="bg-black/40 border-red-800/30">
        <CardHeader>
          <CardTitle className="text-white">Engagement Sentiment Trend</CardTitle>
          <CardDescription className="text-gray-400">Loading engagement data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 border-red-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Engagement Sentiment Trend
          {vehicle && <span className="text-sm text-gray-400">({vehicle})</span>}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Social media engagement and interaction metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Average Engagement</p>
            <p className="text-2xl font-bold text-white">{Math.round(averageEngagement)}%</p>
          </div>
          {averageEngagement > 75 ? (
            <TrendingUp className="h-6 w-6 text-green-500" />
          ) : averageEngagement < 50 ? (
            <TrendingDown className="h-6 w-6 text-red-500" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-yellow-500"></div>
          )}
        </div>
        
        <Progress value={averageEngagement} className="h-2" />

        <div className="space-y-2">
          {engagements.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{item.platform}</span>
              <span className="text-white font-semibold">{item.engagement}%</span>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Based on {engagements.length} social media posts and interactions
          {vehicle && ` about ${vehicle}`}
        </p>
      </CardContent>
    </Card>
  )
}
