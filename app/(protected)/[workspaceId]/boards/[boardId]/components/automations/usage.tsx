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
    <div className="p-2 space-y-8 max-w-[1200px] mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Actions Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Metric className="text-2xl">
                {usedActions.toLocaleString()} / {totalActions.toLocaleString()}
              </Metric>
              <Text className="text-sm text-gray-500 mt-2">
                {totalActions.toLocaleString()} actions per month with Fortek pro
              </Text>
            </div>
            <BadgeDelta deltaType={percentageChange > 0 ? "increase" : "decrease"} className="text-lg text-white">
              {percentageChange.toFixed(1)}%
            </BadgeDelta>
          </div>
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Active Automations</CardTitle>
            <Activity className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Metric className="text-xl">111</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Creators</CardTitle>
            <Users2 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Metric className="text-xl">2</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Tables</CardTitle>
            <Database className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Metric className="text-xl">18</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Active Workflows</CardTitle>
            <GitBranch className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Metric className="text-xl">0</Metric>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Daily Actions Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            className="h-[300px] mt-6"
            data={chartdata}
            index="date"
            categories={["usage"]}
            valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
            yAxisWidth={56}
          />
        </CardContent>
      </Card>
    </div>
  )
}
