"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Users2, Database, GitBranch } from "lucide-react"
import { BarChart, Text } from "@tremor/react"
import { Metric, BadgeDelta } from "@tremor/react"

const chartdata = [
  { date: "Jan 27", usage: 450 },
  { date: "Jan 29", usage: 480 },
  { date: "Jan 31", usage: 420 },
  { date: "Feb 2", usage: 450 },
  { date: "Feb 4", usage: 440 },
  { date: "Feb 6", usage: 180 },
  { date: "Feb 8", usage: 220 },
  { date: "Feb 10", usage: 520 },
  { date: "Feb 12", usage: 580 },
  { date: "Feb 14", usage: 620 },
  { date: "Feb 16", usage: 150 },
]

export default function UsageStats() {
  const usedActions = 5204
  const totalActions = 25000
  const percentage = (usedActions / totalActions) * 100
  const previousActions = 17847

  // Calculate percentage change
  const percentageChange = ((usedActions - previousActions) / previousActions) * 100

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Actions Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Metric>
                {usedActions.toLocaleString()} / {totalActions.toLocaleString()}
              </Metric>
              <Text className="text-xs text-muted-foreground mt-1">
                {totalActions.toLocaleString()} actions per month with Fortek pro
              </Text>
            </div>
            <BadgeDelta deltaType={percentageChange > 0 ? "increase" : "decrease"}>
              {percentageChange.toFixed(1)}%
            </BadgeDelta>
          </div>
          <Progress value={percentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Metric>111</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creators</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Metric>2</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Metric>18</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Metric>0</Metric>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Daily Actions Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            className="h-[200px] mt-4"
            data={chartdata}
            index="date"
            categories={["usage"]}
            colors={["indigo"]}
            valueFormatter={(number: number) => Intl.NumberFormat("us").format(number).toString()}
            yAxisWidth={48}
          />
        </CardContent>
      </Card>
    </div>
  )
}

