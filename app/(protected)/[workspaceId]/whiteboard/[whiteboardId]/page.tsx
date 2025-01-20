"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { WhiteboardCanvas } from "../components/whiteboard-canvas";
import { WhiteboardToolbar } from "../components/whiteboard-toolbar";
import { Card } from "@/components/ui/card";
import { WhiteboardElement, StyleOptions } from "@/types";

export default function WhiteboardDetailPage() {
  const params = useParams();
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'arrow' | 'text'>('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    strokeWidth: 2,
    strokeStyle: 'solid',
    backgroundColor: '#ffffff'
  });

  const { data: whiteboard } = useQuery({
    queryKey: ["whiteboard", params.whiteboardId],
    queryFn: () => fetcher(`/api/whiteboards/${params.whiteboardId}`),
  });

  useEffect(() => {
    if (whiteboard?.elements) {
      setElements(whiteboard.elements);
    }
  }, [whiteboard]);

  const handleExport = (format: 'png' | 'pdf') => {
    // Implémentation de l'export
  };

  const handleSave = () => {
    // Implémentation de la sauvegarde
  };

  return (
    <div className="h-screen bg-gray-50 p-4">
      <Card className="h-full overflow-hidden relative">
        <WhiteboardToolbar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          styleOptions={styleOptions}
          setStyleOptions={setStyleOptions}
          onExport={handleExport}
          onSave={handleSave}
        />
        <WhiteboardCanvas 
          elements={elements} 
          setElements={setElements}
          currentTool={currentTool}
          currentColor={currentColor}
          styleOptions={styleOptions}
        />
      </Card>
    </div>
  );
}