export const boardTemplates = [
  // Modèles existants
  {
    id: "blank",
    title: "Blank Board",
    description: "Start from scratch with an empty board",
    icon: "✨",
    lists: [],
    tags: [],
    type: "General",
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
    type: "Project Management",
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
    type: "Marketing",
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
    type: "Project Management",
  },
  {
    id: "content",
    title: "Content Creation Workflow",
    description: "Manage content creation, editing, and publishing process",
    icon: "📝",
    lists: [
      {
        title: "Ideas",
        cards: [
          { title: "Blog Post: Benefits of AI", description: "Write a blog post on the advantages of AI" },
          { title: "Video Tutorial on React", description: "Create a tutorial video about React basics" },
        ],
      },
      {
        title: "Writing",
        cards: [],
      },
      {
        title: "Editing",
        cards: [],
      },
      {
        title: "Ready for Publishing",
        cards: [],
      },
      {
        title: "Published",
        cards: [],
      },
    ],
    tags: [
      { name: "Blog", color: "#CA8A04" },
      { name: "Video", color: "#10B981" },
      { name: "Social Media", color: "#4F46E5" },
    ],
    type: "Content Creation",
  },

  // Modèles supplémentaires
  {
    id: "sales-crm",
    title: "Sales CRM",
    description: "Track leads, deals, and customer interactions",
    icon: "📈",
    lists: [
      { title: "Lead Generation", cards: [] },
      { title: "Qualified Leads", cards: [] },
      { title: "Proposal Sent", cards: [] },
      { title: "Negotiation", cards: [] },
      { title: "Closed Deals", cards: [] },
    ],
    tags: [
      { name: "New Lead", color: "#E11D48" },
      { name: "Follow Up", color: "#F59E0B" },
      { name: "Hot Lead", color: "#10B981" },
    ],
    type: "Sales",
  },
  {
    id: "hr-onboarding",
    title: "HR Onboarding",
    description: "Track employee onboarding tasks",
    icon: "⌨️",
    lists: [
      { title: "Pre-boarding", cards: [] },
      { title: "First Day", cards: [] },
      { title: "Training", cards: [] },
      { title: "Integration", cards: [] },
    ],
    tags: [
      { name: "Documentation", color: "#CA8A04" },
      { name: "Meetings", color: "#059669" },
      { name: "Training", color: "#16A34A" },
    ],
    type: "HR",
  },
  {
    id: "event-planning",
    title: "Event Planning",
    description: "Plan and track event tasks",
    icon: "🎉",
    lists: [
      { title: "Venue Selection", cards: [] },
      { title: "Invitations", cards: [] },
      { title: "Logistics", cards: [] },
      { title: "Promotion", cards: [] },
      { title: "Event Day", cards: [] },
    ],
    tags: [
      { name: "VIP", color: "#E11D48" },
      { name: "Speakers", color: "#2563EB" },
      { name: "Marketing", color: "#16A34A" },
    ],
    type: "Event Management",
  },
  {
    id: "product-launch",
    title: "Product Launch",
    description: "Track all tasks for a product launch",
    icon: "🚀",
    lists: [
      { title: "Planning", cards: [] },
      { title: "Development", cards: [] },
      { title: "Marketing", cards: [] },
      { title: "Launch", cards: [] },
    ],
    tags: [
      { name: "Feature", color: "#16A34A" },
      { name: "Bug", color: "#E11D48" },
      { name: "Marketing", color: "#2563EB" },
    ],
    type: "Product Management",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Manage customer support tickets and inquiries",
    icon: "📞",
    lists: [
      { title: "New Tickets", cards: [] },
      { title: "In Progress", cards: [] },
      { title: "Resolved", cards: [] },
    ],
    tags: [
      { name: "Urgent", color: "#DC2626" },
      { name: "General", color: "#F59E0B" },
      { name: "Resolved", color: "#10B981" },
    ],
    type: "Customer Support",
  },
  {
    id: "inventory-management",
    title: "Inventory Management",
    description: "Track stock levels and orders",
    icon: "📦",
    lists: [
      { title: "In Stock", cards: [] },
      { title: "Low Stock", cards: [] },
      { title: "Out of Stock", cards: [] },
      { title: "Orders", cards: [] },
    ],
    tags: [
      { name: "Restock", color: "#F59E0B" },
      { name: "Sold Out", color: "#E11D48" },
      { name: "Available", color: "#10B981" },
    ],
    type: "Inventory Management",
  },
  {
    id: "finance-budgeting",
    title: "Finance & Budgeting",
    description: "Track financial goals and expenses",
    icon: "💰",
    lists: [
      { title: "Income", cards: [] },
      { title: "Expenses", cards: [] },
      { title: "Savings Goals", cards: [] },
      { title: "Investments", cards: [] },
    ],
    tags: [
      { name: "Income", color: "#16A34A" },
      { name: "Fixed Expenses", color: "#2563EB" },
      { name: "Variable Expenses", color: "#F59E0B" },
    ],
    type: "Finance",
  },
];
