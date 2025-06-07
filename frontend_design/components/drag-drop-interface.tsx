"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, GripVertical, Bot, User } from "lucide-react"

interface Insight {
  title: string
  description: string
  sentiment: string
  impact: string
  sources: number
}

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface DragDropInterfaceProps {
  vehicle: string
  insights: Insight[]
}

export function DragDropInterface({ vehicle, insights }: DragDropInterfaceProps) {
  const [droppedInsights, setDroppedInsights] = useState<Insight[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Hello! I'm here to help explain the sentiment analysis for ${vehicle}. Drag any insight from the report to ask specific questions about it.`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [draggedInsight, setDraggedInsight] = useState<Insight | null>(null)

  const handleDragStart = (insight: Insight) => {
    setDraggedInsight(insight)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedInsight && !droppedInsights.find((i) => i.title === draggedInsight.title)) {
      setDroppedInsights([...droppedInsights, draggedInsight])

      // Auto-generate a question about the dropped insight
      const autoMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: `Why is the sentiment for "${draggedInsight.title}" ${draggedInsight.sentiment}?`,
        timestamp: new Date(),
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateInsightExplanation(draggedInsight),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, autoMessage, botResponse])
    }
    setDraggedInsight(null)
  }

  const generateInsightExplanation = (insight: Insight): string => {
    const explanations = {
      "Performance Praise": `The sentiment for "${insight.title}" is positive because our analysis of ${insight.sources} sources shows consistent praise for acceleration, handling, and overall driving dynamics. Social media posts frequently use terms like "incredible," "amazing," and "best-in-class" when discussing performance aspects.`,
      "Price Concerns": `The sentiment for "${insight.title}" is negative due to recurring discussions about high maintenance costs, insurance premiums, and overall ownership expenses. Forum discussions and reviews often mention these financial concerns as a significant drawback.`,
      "Design Appeal": `The sentiment for "${insight.title}" is highly positive because the aesthetic design consistently receives widespread appreciation across all platforms. Visual content featuring the vehicle generates high engagement rates and positive comments about styling and visual appeal.`,
      "Reliability Questions": `The sentiment for "${insight.title}" is neutral because while there are some concerns about long-term reliability mentioned in forums and reviews, these are balanced by positive experiences from other owners and official manufacturer responses addressing these concerns.`,
    }

    return (
      explanations[insight.title as keyof typeof explanations] ||
      `The sentiment analysis for "${insight.title}" is based on comprehensive data analysis from ${insight.sources} sources, showing a ${insight.sentiment} trend with ${insight.impact} impact on overall brand perception.`
    )
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: generateContextualResponse(inputMessage, droppedInsights),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setInputMessage("")
  }

  const generateContextualResponse = (question: string, context: Insight[]): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("why") && lowerQuestion.includes("low")) {
      return "Sentiment scores can be low due to several factors: negative reviews highlighting specific issues, social media complaints about particular aspects, or comparative discussions where the vehicle doesn't perform as well as competitors. The AI analyzes the emotional tone and context of mentions to determine overall sentiment."
    }

    if (lowerQuestion.includes("source") || lowerQuestion.includes("data")) {
      return "Our data comes from multiple sources including Twitter, Instagram, Facebook, automotive forums like Reddit and specialized car communities, news articles from major automotive publications, professional reviews, and user-generated content. We process thousands of mentions daily using natural language processing."
    }

    if (lowerQuestion.includes("improve") || lowerQuestion.includes("better")) {
      return "To improve sentiment, manufacturers typically focus on addressing the most frequently mentioned concerns. Based on the analysis, key areas for improvement would be addressing price/value perception, enhancing reliability communication, and leveraging the strong positive sentiment around performance and design in marketing efforts."
    }

    return "I can help explain any aspect of the sentiment analysis. Try asking about specific insights you've dropped here, data sources, methodology, or how to interpret the results for strategic decision-making."
  }

  const removeInsight = (insightToRemove: Insight) => {
    setDroppedInsights(droppedInsights.filter((i) => i.title !== insightToRemove.title))
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Draggable Insights */}
      <Card className="bg-black/40 border-red-800/30">
        <CardHeader>
          <CardTitle className="text-white">Report Insights</CardTitle>
          <CardDescription className="text-gray-400">
            Drag insights to the chat to ask specific questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(insight)}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 cursor-move hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{insight.title}</h4>
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
                    </div>
                    <p className="text-sm text-gray-400">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-black/40 border-red-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Explainer Chat
          </CardTitle>
          <CardDescription className="text-gray-400">Ask questions about dropped insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropped Insights */}
          {droppedInsights.length > 0 && (
            <div
              className="min-h-[100px] p-4 border-2 border-dashed border-red-800/50 rounded-lg bg-red-900/10"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p className="text-sm text-gray-400 mb-3">Active Context:</p>
              <div className="space-y-2">
                {droppedInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                    <span className="text-white text-sm">{insight.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInsight(insight)}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Zone */}
          {droppedInsights.length === 0 && (
            <div
              className="min-h-[100px] p-4 border-2 border-dashed border-gray-600 rounded-lg bg-slate-800/20 flex items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p className="text-gray-500 text-center">Drop insights here to ask specific questions about them</p>
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea className="h-[300px] w-full border border-slate-700 rounded-lg p-4 bg-slate-900/50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user" ? "bg-red-600" : "bg-blue-600"}`}
                    >
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${message.type === "user" ? "bg-red-600 text-white" : "bg-slate-700 text-gray-100"}`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about the analysis..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Button onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
