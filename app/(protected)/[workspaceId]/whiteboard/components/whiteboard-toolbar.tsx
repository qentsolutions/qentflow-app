"use client";

import { Palette, Square, Circle, ArrowRight, Type, MousePointer, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "./color-picker";
import { StylePicker } from "./style-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StyleOptions } from "@/types";

interface WhiteboardToolbarProps {
  currentTool: string;
  setCurrentTool: (tool: 'select' | 'rectangle' | 'circle' | 'arrow' | 'text') => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  styleOptions: StyleOptions;
  setStyleOptions: (options: StyleOptions) => void;
  onExport: (format: 'png' | 'pdf') => void;
  onSave: () => void;
}

export function WhiteboardToolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  styleOptions,
  setStyleOptions,
  onExport,
  onSave
}: WhiteboardToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={currentTool === tool.id ? "default" : "ghost"}
            size="icon"
            onClick={() => setCurrentTool(tool.id as any)}
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <ColorPicker 
        currentColor={currentColor} 
        onColorSelect={setCurrentColor} 
      />

      <StylePicker
        options={styleOptions}
        onChange={setStyleOptions}
      />

      <Select onValueChange={(value) => onExport(value as 'png' | 'pdf')}>
        <SelectTrigger>
          <Download className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">Export as PNG</SelectItem>
          <SelectItem value="pdf">Export as PDF</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          onSave();
          toast.success("Whiteboard saved!");
        }}
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}