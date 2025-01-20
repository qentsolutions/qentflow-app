"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { WhiteboardElement, WhiteboardState, Point, StyleOptions } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useDebounce } from "@/hooks/use-debounce";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface WhiteboardCanvasProps {
  elements: WhiteboardElement[];
  setElements: (elements: WhiteboardElement[]) => void;
  currentTool: 'select' | 'rectangle' | 'circle' | 'arrow' | 'text';
  currentColor: string;
  styleOptions: StyleOptions;
}

export function WhiteboardCanvas({ 
  elements, 
  setElements, 
  currentTool, 
  currentColor,
  styleOptions
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  
  const [state, setState] = useState<WhiteboardState>({
    elements: elements,
    selectedElement: null,
    isDrawing: false,
    currentTool,
    currentColor,
    currentStrokeWidth: styleOptions.strokeWidth,
    currentStrokeStyle: styleOptions.strokeStyle,
    currentBackgroundColor: styleOptions.backgroundColor,
    showConnectors: false,
    nearestConnector: null
  });

  const debouncedElements = useDebounce(elements, 1000);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      currentTool,
      currentColor,
      currentStrokeWidth: styleOptions.strokeWidth,
      currentStrokeStyle: styleOptions.strokeStyle,
      currentBackgroundColor: styleOptions.backgroundColor
    }));
  }, [currentTool, currentColor, styleOptions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach(element => drawElement(ctx, element));

    // Draw connectors if needed
    if (state.showConnectors) {
      elements.forEach(element => drawConnectors(ctx, element));
    }

    // Draw nearest connector indicator
    if (state.nearestConnector) {
      drawConnectorIndicator(ctx, state.nearestConnector.point);
    }
  }, [elements, state.showConnectors, state.nearestConnector]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const { startPoint, endPoint, type, color, strokeWidth, strokeStyle } = element;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    
    if (strokeStyle === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (strokeStyle === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      ctx.setLineDash([]);
    }

    switch (type) {
      case 'rectangle':
        if (element.width && element.height) {
          ctx.rect(startPoint.x, startPoint.y, element.width, element.height);
        }
        break;
      case 'circle':
        if (endPoint) {
          const radius = Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) +
            Math.pow(endPoint.y - startPoint.y, 2)
          );
          ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        }
        break;
      case 'arrow':
        if (endPoint) {
          drawArrow(ctx, startPoint, endPoint);
        }
        break;
      case 'text':
        if (element.text) {
          ctx.font = `${strokeWidth * 5}px Arial`;
          ctx.fillStyle = color;
          ctx.fillText(element.text, startPoint.x, startPoint.y);
        }
        break;
    }

    if (type !== 'text') {
      if (element.backgroundColor) {
        ctx.fillStyle = element.backgroundColor;
        ctx.fill();
      }
      ctx.stroke();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const headLength = 10;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = state.currentColor;
    ctx.fill();
  };

  const drawConnectors = (ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const connectors = calculateConnectorPoints(element);
    connectors.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.fill();
    });
  };

  const drawConnectorIndicator = (ctx: CanvasRenderingContext2D, point: Point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fill();
  };

  const isPointInElement = (point: Point, element: WhiteboardElement): boolean => {
    if (!element.width || !element.height) return false;

    const { startPoint, width, height } = element;
    
    switch (element.type) {
      case 'rectangle':
        return (
          point.x >= startPoint.x &&
          point.x <= startPoint.x + width &&
          point.y >= startPoint.y &&
          point.y <= startPoint.y + height
        );
      case 'circle':
        const centerX = startPoint.x + width / 2;
        const centerY = startPoint.y + height / 2;
        const radius = Math.min(width, height) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      default:
        return false;
    }
  };

  const calculateConnectorPoints = (element: WhiteboardElement): Point[] => {
    if (!element.width || !element.height) return [];

    const { startPoint, width, height } = element;
    return [
      { x: startPoint.x + width / 2, y: startPoint.y }, // top
      { x: startPoint.x + width, y: startPoint.y + height / 2 }, // right
      { x: startPoint.x + width / 2, y: startPoint.y + height }, // bottom
      { x: startPoint.x, y: startPoint.y + height / 2 }, // left
    ];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const startPoint = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };

    const clickedElement = elements.find(element => 
      isPointInElement(startPoint, element)
    );

    if (clickedElement) {
      setState(prev => ({
        ...prev,
        selectedElement: clickedElement,
        isDrawing: currentTool === 'select'
      }));
      return;
    }

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: WhiteboardElement = {
          id: uuidv4(),
          type: 'text',
          startPoint,
          color: currentColor,
          strokeWidth: styleOptions.strokeWidth,
          strokeStyle: styleOptions.strokeStyle,
          backgroundColor: styleOptions.backgroundColor,
          text
        };
        setElements([...elements, newElement]);
      }
      return;
    }

    const newElement: WhiteboardElement = {
      id: uuidv4(),
      type: currentTool,
      startPoint,
      color: currentColor,
      strokeWidth: styleOptions.strokeWidth,
      strokeStyle: styleOptions.strokeStyle,
      backgroundColor: styleOptions.backgroundColor
    };

    setState(prev => ({
      ...prev,
      isDrawing: true,
      selectedElement: newElement
    }));

    setElements([...elements, newElement]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPoint = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };

    if (!state.isDrawing) {
      const nearest = findNearestConnector(currentPoint);
      setState(prev => ({ ...prev, nearestConnector: nearest }));
      return;
    }

    if (state.selectedElement) {
      const updatedElements = elements.map(el => {
        if (el.id === state.selectedElement?.id) {
          if (currentTool === 'select') {
            const dx = currentPoint.x - (state.selectedElement.startPoint.x);
            const dy = currentPoint.y - (state.selectedElement.startPoint.y);
            
            return {
              ...el,
              startPoint: currentPoint,
              endPoint: el.endPoint ? {
                x: el.endPoint.x + dx,
                y: el.endPoint.y + dy
              } : undefined
            };
          } else {
            return {
              ...el,
              endPoint: currentPoint,
              width: currentPoint.x - el.startPoint.x,
              height: currentPoint.y - el.startPoint.y
            };
          }
        }
        return el;
      });

      setElements(updatedElements);
    }
  };

  const handleMouseUp = () => {
    if (state.selectedElement && state.nearestConnector && currentTool === 'arrow') {
      const updatedElement = {
        ...state.selectedElement,
        endPoint: state.nearestConnector.point,
        connectedTo: [state.nearestConnector.elementId]
      };

      setElements(prev => 
        prev.map(el => 
          el.id === updatedElement.id ? updatedElement : el
        )
      );
    }

    setState(prev => ({
      ...prev,
      isDrawing: false,
      selectedElement: null,
      nearestConnector: null
    }));

    saveChanges(elements);
  };

  const findNearestConnector = (point: Point): { elementId: string; point: Point } | null => {
    let nearest = null;
    let minDistance = 20;

    elements.forEach(element => {
      const connectors = calculateConnectorPoints(element);
      connectors.forEach(connector => {
        const distance = Math.sqrt(
          Math.pow(point.x - connector.x, 2) + 
          Math.pow(point.y - connector.y, 2)
        );
        if (distance < minDistance) {
          nearest = { elementId: element.id, point: connector };
          minDistance = distance;
        }
      });
    });

    return nearest;
  };

  const saveChanges = async (elements: WhiteboardElement[]) => {
    try {
      await fetch(`/api/whiteboards/${params.whiteboardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          workspaceId: currentWorkspace?.id,
        }),
      });
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}