const RECENT_BOARDS_KEY = "recentBoards"

export function addRecentBoard(boardId: string) {
  const recentBoards = getRecentBoards()
  const updatedBoards = [boardId, ...recentBoards.filter((id) => id !== boardId)].slice(0, 4)
  localStorage.setItem(RECENT_BOARDS_KEY, JSON.stringify(updatedBoards))
}

export function getRecentBoards(): string[] {
  const storedBoards = localStorage.getItem(RECENT_BOARDS_KEY)
  return storedBoards ? JSON.parse(storedBoards) : []
}

