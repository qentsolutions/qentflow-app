"use client";

import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BoardNavbarProps {
  board: Board;
}

export const BoardNavbar = ({ board }: BoardNavbarProps) => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Boards", href: `/${currentWorkspace?.id}/boards` },
      { label: board.title },
    ]);
  }, [board, setBreadcrumbs, currentWorkspace?.id]);

  if (!board) return null;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center justify-between">
        <Avatar className="h-10 w-10 mr-2">
          <AvatarImage
            src={`https://avatar.vercel.sh/${board.id}.png`}
            alt={board.title}
          />
          <AvatarFallback>{board.title.charAt(0)}</AvatarFallback>
        </Avatar>
        <BoardTitleForm data={board} />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info size={25} className="text-gray-500" />
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">How to Use Our SaaS</h2>
            
            {tutorialSteps.map((step, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  {step.title}
                </h3>
                <div className="relative w-full h-48">
                  <Image
                    src={step.image}
                    alt={step.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <p className="text-gray-700">{step.description}</p>
                {step.tip && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 mt-2">
                    <p className="text-sm text-yellow-700"><strong>Tip:</strong> {step.tip}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center mt-6">
              <Button className="bg-blue-500 text-white hover:bg-blue-600">
                Get Started
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const tutorialSteps = [
  {
    title: "Create a Board",
    description: "Start by creating a new board. This will be your main workspace for organizing tasks and ideas.",
    tip: "Use descriptive names for your boards to easily identify them later.",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Add Lists",
    description: "Within your board, create lists to categorize your tasks. Common lists include 'To Do', 'In Progress', and 'Done'.",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Create Cards",
    description: "Add cards to your lists. Each card represents a task or idea. You can drag and drop cards between lists as their status changes.",
    tip: "Keep card titles short and descriptive for quick understanding.",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Customize Cards",
    description: "Click on a card to add more details. You can add descriptions, checklists, due dates, and attachments.",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Collaborate",
    description: "Invite team members to your board. They can view, edit, and move cards, fostering collaboration.",
    tip: "Assign team members to specific cards to clarify responsibility.",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Track Progress",
    description: "Use the board overview to get a bird's-eye view of your project's progress. Move cards across lists to update their status.",
    image: "/placeholder.svg?height=200&width=300"
  }
];

