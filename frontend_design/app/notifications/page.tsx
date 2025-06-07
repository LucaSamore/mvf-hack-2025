"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Car, ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Settings } from "lucide-react"
import Link from "next/link"

const notifications = [
  {
    id: 1,
    type: "sentiment_drop",
    brand: "Ferrari",
    model: "SF90 Stradale",
    message: "Sentiment score dropped by 8% in the last 24 hours",
    severity: "high",
    timestamp: "2 hours ago",
    details: "Negative discussions about reliability issues trending on social media",
  },
  {
    id: 2,
    type: "sentiment_spike",
    brand: "Lamborghini",
    model: "Revuelto",
    message: "Positive sentiment surge detected",
    severity: "medium",
    timestamp: "4 hours ago",
    details: "New performance review generated significant positive buzz",
  },
  {
    id: 3,
    type: "mention_volume",
    brand: "McLaren",
    model: "750S",
    message: "Mention volume increased by 150%",
    severity: "medium",
    timestamp: "6 hours ago",
    details: "Launch event coverage driving increased social media activity",
  },
  {
    id: 4,
    type: "competitor_alert",
    brand: "Porsche",
    model: "911 GT3 RS",
    message: "Competitor comparison trending",
    severity: "low",
    timestamp: "1 day ago",
    details: "Multiple comparisons with Ferrari 488 GTB gaining traction",
  },
  {
    id: 5,
    type: "sentiment_drop",
    brand: "Aston Martin",
    model: "DB12",
    message: "Negative sentiment trend detected",
    severity: "high",
    timestamp: "1 day ago",
    details: "Price concerns and delivery delays mentioned frequently",
  },
]

const watchedBrands = [
  { name: "Ferrari", models: ["SF90 Stradale", "296 GTB", "F8 Tributo"], active: true },
  { name: "Lamborghini", models: ["Revuelto", "Huracán", "Urus"], active: true },
  { name: "McLaren", models: ["750S", "720S", "Artura"], active: false },
  { name: "Porsche", models: ["911 GT3 RS", "Taycan", "Cayenne"], active: true },
]

export default function NotificationsPage() {
  const [alertSettings, setAlertSettings] = useState({
    sentimentDrops: true,
    sentimentSpikes: true,
    mentionVolume: true,
    competitorAlerts: false,
    emailNotifications: true,
    pushNotifications: true,
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-600"
      case "medium":
        return "bg-yellow-600"
      case "low":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "sentiment_drop":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "sentiment_spike":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "mention_volume":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "competitor_alert":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const toggleBrandWatch = (brandName: string) => {
    // In a real app, this would update the backend
    console.log(`Toggling watch for ${brandName}`)
  }

  const updateAlertSetting = (setting: string, value: boolean) => {
    setAlertSettings((prev) => ({ ...prev, [setting]: value }))
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
              <Bell className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold text-white">Notifications & Alerts</span>
            </div>
          </div>
          <Badge variant="outline" className="border-red-800 text-white">
            {notifications.filter((n) => n.severity === "high").length} High Priority
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="bg-black/40 border-red-800/30">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-red-600">
              Recent Alerts
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-red-600">
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-black/40 border-red-800/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Notifications</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest alerts and updates for your watched brands and models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">
                              {notification.brand} {notification.model}
                            </h4>
                            <Badge className={getSeverityColor(notification.severity)}>{notification.severity}</Badge>
                            <span className="text-sm text-gray-400">{notification.timestamp}</span>
                          </div>
                          <p className="text-gray-300 mb-2">{notification.message}</p>
                          <p className="text-sm text-gray-400">{notification.details}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-red-800 text-white hover:bg-red-800/20">
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-4">
            <Card className="bg-black/40 border-red-800/30">
              <CardHeader>
                <CardTitle className="text-white">Watched Brands & Models</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage the brands and models you want to monitor for sentiment changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {watchedBrands.map((brand) => (
                    <div key={brand.name} className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-red-500" />
                          <h3 className="text-white font-semibold">{brand.name}</h3>
                        </div>
                        <Switch checked={brand.active} onCheckedChange={() => toggleBrandWatch(brand.name)} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {brand.models.map((model) => (
                          <Badge key={model} variant="outline" className="border-gray-600 text-gray-300">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <Button className="bg-red-600 hover:bg-red-700">Add New Brand/Model</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-black/40 border-red-800/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Alert Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Alert Types</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Sentiment Drops</p>
                      <p className="text-sm text-gray-400">Get notified when sentiment scores decrease significantly</p>
                    </div>
                    <Switch
                      checked={alertSettings.sentimentDrops}
                      onCheckedChange={(value) => updateAlertSetting("sentimentDrops", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Sentiment Spikes</p>
                      <p className="text-sm text-gray-400">Get notified when sentiment scores increase significantly</p>
                    </div>
                    <Switch
                      checked={alertSettings.sentimentSpikes}
                      onCheckedChange={(value) => updateAlertSetting("sentimentSpikes", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Mention Volume Changes</p>
                      <p className="text-sm text-gray-400">Get notified when mention volume changes dramatically</p>
                    </div>
                    <Switch
                      checked={alertSettings.mentionVolume}
                      onCheckedChange={(value) => updateAlertSetting("mentionVolume", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Competitor Alerts</p>
                      <p className="text-sm text-gray-400">Get notified about competitor comparisons and mentions</p>
                    </div>
                    <Switch
                      checked={alertSettings.competitorAlerts}
                      onCheckedChange={(value) => updateAlertSetting("competitorAlerts", value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-700">
                  <h4 className="text-white font-medium">Delivery Methods</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive alerts via email</p>
                    </div>
                    <Switch
                      checked={alertSettings.emailNotifications}
                      onCheckedChange={(value) => updateAlertSetting("emailNotifications", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Push Notifications</p>
                      <p className="text-sm text-gray-400">Receive real-time push notifications</p>
                    </div>
                    <Switch
                      checked={alertSettings.pushNotifications}
                      onCheckedChange={(value) => updateAlertSetting("pushNotifications", value)}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <Button className="bg-red-600 hover:bg-red-700">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
