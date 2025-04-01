"use client"

import { useBreadcrumbs } from "@/hooks/use-breadcrumb"
import { BoardList } from "./components/board-list"
import { useEffect } from "react"

const BoardPage = () => {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([{ label: "Projects" }])
  }, [setBreadcrumbs])

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-gray-50">
      <div className="pl-2 pt-2 w-full max-w-7xl mx-auto">
        <BoardList />
      </div>
    </div>
  )
}

export default BoardPage
