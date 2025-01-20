export const boardTemplates = [
    {
      id: "blank",
      title: "Blank Board",
      description: "Start from scratch with an empty board",
      icon: "✨",
      lists: [],
      tags: [],
    },
    {
      id: "software",
      title: "Software Development",
      description: "Manage software development projects",
      icon: "💻",
      lists: [
        {
          title: "Backlog",
          cards: [
            { title: "Research new technologies", description: "Evaluate potential new technologies for the project" },
            { title: "Technical Documentation", description: "Create technical documentation for the project" },
          ],
        },
        {
          title: "To Do",
          cards: [
            { title: "Setup Development Environment", description: "Install and configure necessary tools" },
            { title: "Create Project Structure", description: "Set up initial project architecture" },
          ],
        },
        {
          title: "In Progress",
          cards: [],
        },
        {
          title: "Code Review",
          cards: [],
        },
        {
          title: "Testing",
          cards: [],
        },
        {
          title: "Done",
          cards: [],
        },
      ],
      tags: [
        { name: "Bug", color: "#E11D48" },
        { name: "Feature", color: "#2563EB" },
        { name: "Enhancement", color: "#16A34A" },
        { name: "Documentation", color: "#CA8A04" },
      ],
    },
    {
      id: "marketing",
      title: "Marketing Campaign",
      description: "Plan and track marketing campaigns",
      icon: "📢",
      lists: [
        {
          title: "Campaign Ideas",
          cards: [
            { title: "Research target audience", description: "Define target demographics and preferences" },
            { title: "Competitor analysis", description: "Analyze competitor marketing strategies" },
          ],
        },
        {
          title: "Planning",
          cards: [
            { title: "Set campaign goals", description: "Define measurable objectives" },
            { title: "Budget planning", description: "Allocate resources and budget" },
          ],
        },
        {
          title: "Content Creation",
          cards: [],
        },
        {
          title: "Review",
          cards: [],
        },
        {
          title: "Scheduled",
          cards: [],
        },
        {
          title: "Published",
          cards: [],
        },
      ],
      tags: [
        { name: "Social Media", color: "#4F46E5" },
        { name: "Email", color: "#059669" },
        { name: "Content", color: "#EA580C" },
        { name: "Analytics", color: "#7C3AED" },
      ],
    },
    {
      id: "kanban",
      title: "Kanban System",
      description: "Classic Kanban board setup",
      icon: "📋",
      lists: [
        {
          title: "Backlog",
          cards: [],
        },
        {
          title: "To Do",
          cards: [],
        },
        {
          title: "In Progress",
          cards: [],
        },
        {
          title: "Review",
          cards: [],
        },
        {
          title: "Done",
          cards: [],
        },
      ],
      tags: [
        { name: "High Priority", color: "#DC2626" },
        { name: "Medium Priority", color: "#F59E0B" },
        { name: "Low Priority", color: "#10B981" },
      ],
    },
  ];