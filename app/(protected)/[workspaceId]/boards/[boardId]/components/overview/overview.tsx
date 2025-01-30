"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CalendarDays,
  CheckSquare,
  ListTodo,
  Users,
  Clock,
  Tag,
  AlertTriangle,
  Zap,
  TrendingUp,
  BarChart2,
  Activity,
  Star,
  Target,
  Award,
} from "lucide-react"
import { BarChart, DonutChart } from "@tremor/react"

interface BoardOverviewProps {
  board: {
    title: string
    lists: {
      id: string
      title: string
      cards: {
        id: string
        title: string
        createdAt: Date
        tasks: {
          id: string
          title: string
          completed: boolean
        }[]
        tags: {
          id: string
          name: string
          color: string
        }[]
      }[]
    }[]
    User: {
      id: string
      name: string
    }[]
    createdAt: Date
  }
}

export function BoardOverview({ board }: BoardOverviewProps) {
  const totalCards = board.lists.reduce((acc, list) => acc + list.cards.length, 0)
  const totalTasks = board.lists.reduce(
    (acc, list) => acc + list.cards.reduce((cardAcc, card) => cardAcc + card.tasks.length, 0),
    0,
  )
  const completedTasks = board.lists.reduce(
    (acc, list) =>
      acc + list.cards.reduce((cardAcc, card) => cardAcc + card.tasks.filter((task) => task.completed).length, 0),
    0,
  )
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const overdueTasks = board.lists.reduce(
    (acc, list) => acc + list.cards.filter((card) => card.dueDate && new Date(card.dueDate) < new Date()).length,
    0,
  )

  const allTags = board.lists.flatMap((list) => list.cards.flatMap((card) => card.tags))
  const uniqueTags = Array.from(new Set(allTags.map((tag) => tag.name)))

  const boardAge = Math.floor((new Date().getTime() - new Date(board.createdAt).getTime()) / (1000 * 3600 * 24))

  const cardsPerList = board.lists.map((list) => ({
    name: list.title,
    "Number of Cards": list.cards.length,
  }))

  const recentActivity = board.lists
    .flatMap((list) => list.cards)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const taskCompletionRate = completedTasks / boardAge

  // Nouvelles métriques
  const averageTasksPerCard = totalTasks / totalCards
  const cardCreationRate = totalCards / boardAge

  const priorityDistribution = board.lists
    .flatMap((list) => list.cards)
    .reduce(
      (acc, card) => {
        acc[card.priority] = (acc[card.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const priorityData = Object.entries(priorityDistribution).map(([name, value]) => ({ name, value }))

  const mostUsedTags = allTags.reduce(
    (acc, tag) => {
      acc[tag.name] = (acc[tag.name] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topTags = Object.entries(mostUsedTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const cardsCreatedLastWeek = board.lists
    .flatMap((list) => list.cards)
    .filter((card) => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(card.createdAt) > oneWeekAgo
    }).length

  const productivityScore = (completedTasks / totalTasks) * 100 - (overdueTasks / totalCards) * 10

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{board.lists.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCards}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {completedTasks} / {totalTasks}
          </div>
          <Progress value={completionPercentage} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{board.User.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueTasks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueTags.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Board Age (Days)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{boardAge}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskCompletionRate.toFixed(2)}/day</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Tasks per Card</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageTasksPerCard.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Card Creation Rate</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cardCreationRate.toFixed(2)}/day</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cards Created (Last Week)</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cardsCreatedLastWeek}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productivityScore.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cards per List</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BarChart
            className="mt-6"
            data={cardsPerList}
            index="name"
            categories={["Number of Cards"]}
            colors={["blue"]}
            yAxisWidth={48}
          />
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Priority Distribution</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <DonutChart
            className="mt-6"
            data={priorityData}
            category="value"
            index="name"
            valueFormatter={(number: number) => `${number} cards`}
            colors={["slate", "violet", "indigo"]}
          />
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentActivity.map((card) => (
              <li key={card.id} className="text-sm">
                {card.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top 5 Tags</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topTags.map((tag) => (
              <li key={tag.name} className="text-sm flex justify-between">
                <span>{tag.name}</span>
                <span>{tag.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

