"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

const colors = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", 
  "#ff00ff", "#00ffff", "#808080", "#800000", "#808000", "#008000",
  "#800080", "#008080", "#000080", "#ff4500"
];

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}