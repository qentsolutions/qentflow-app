"use client";

import { Slider } from "@/components/ui/slider";
import { StyleOptions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StylePickerProps {
    options: StyleOptions;
    onChange: (options: StyleOptions) => void;
}

export function StylePicker({ options, onChange }: StylePickerProps) {
    return (
        <div className="space-y-4 p-4">
            <div>
                <label className="text-sm font-medium">Stroke Width</label>
                <Slider
                    value={[options.strokeWidth]}
                    onValueChange={([value]) =>
                        onChange({ ...options, strokeWidth: value })
                    }
                    min={1}
                    max={10}
                    step={1}
                />
            </div>

            <div>
                <label className="text-sm font-medium">Stroke Style</label>
                <Select
                    value={options.strokeStyle}
                    onValueChange={(value: 'solid' | 'dashed' | 'dotted') =>
                        onChange({ ...options, strokeStyle: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="text-sm font-medium">Background Color</label>
                <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) =>
                        onChange({ ...options, backgroundColor: e.target.value })
                    }
                    className="w-full h-8 cursor-pointer"
                />
            </div>
        </div>
    );
}