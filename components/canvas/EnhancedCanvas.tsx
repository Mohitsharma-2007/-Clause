"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Table,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Grid3X3,
  Type,
  Image,
  Palette,
  Move,
  RotateCw,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CanvasItem = {
  id: string;
  type: "chart" | "table" | "text" | "image" | "pdf";
  title: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  zIndex: number;
  data?: any;
};

interface EnhancedCanvasProps {
  items: CanvasItem[];
  onItemsChange: (items: CanvasItem[]) => void;
  className?: string;
}

export default function EnhancedCanvas({
  items,
  onItemsChange,
  className,
}: EnhancedCanvasProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"grid" | "list" | "free">("grid");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    setSelectedItem(itemId);
    setIsDragging(true);
    const item = items.find(i => i.id === itemId);
    if (item) {
      setDragOffset({
        x: e.clientX - item.position.x,
        y: e.clientY - item.position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedItem) {
      const updatedItems = items.map(item =>
        item.id === selectedItem
          ? {
              ...item,
              position: {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
              },
            }
          : item
      );
      onItemsChange(updatedItems);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDeleteItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
    setSelectedItem(null);
  };

  const handleDuplicateItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newItem = {
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        position: {
          x: item.position.x + 20,
          y: item.position.y + 20,
        },
      };
      onItemsChange([...items, newItem]);
    }
  };

  const handleToggleVisibility = (itemId: string) => {
    onItemsChange(items.map(item =>
      item.id === itemId ? { ...item, visible: !item.visible } : item
    ));
  };

  const renderCanvasItem = (item: CanvasItem) => {
    if (!item.visible) return null;

    const itemStyles = {
      position: "absolute" as const,
      left: `${item.position.x}px`,
      top: `${item.position.y}px`,
      width: `${item.size.width}px`,
      height: `${item.size.height}px`,
      zIndex: item.zIndex,
      transform: `scale(${zoom})`,
      transformOrigin: "top left",
    };

    const isSelected = selectedItem === item.id;

    switch (item.type) {
      case "chart":
        return (
          <motion.div
            key={item.id}
            style={itemStyles}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-surface/40 border border-foreground/10 rounded-lg p-4 cursor-move",
              isSelected && "ring-2 ring-foreground/50"
            )}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDuplicateItem(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="bg-background/50 rounded p-3 h-32 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </motion.div>
        );

      case "table":
        return (
          <motion.div
            key={item.id}
            style={itemStyles}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-surface/40 border border-foreground/10 rounded-lg p-4 cursor-move",
              isSelected && "ring-2 ring-foreground/50"
            )}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDuplicateItem(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="bg-background/50 rounded p-3 h-32 flex items-center justify-center">
              <Table className="w-8 h-8 text-muted-foreground" />
            </div>
          </motion.div>
        );

      case "text":
        return (
          <motion.div
            key={item.id}
            style={itemStyles}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-surface/40 border border-foreground/10 rounded-lg p-4 cursor-move",
              isSelected && "ring-2 ring-foreground/50"
            )}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDuplicateItem(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="bg-background/50 rounded p-3 h-32 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                {item.content || "Text content will appear here..."}
              </p>
            </div>
          </motion.div>
        );

      case "pdf":
        return (
          <motion.div
            key={item.id}
            style={itemStyles}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-surface/40 border border-foreground/10 rounded-lg p-4 cursor-move",
              isSelected && "ring-2 ring-foreground/50"
            )}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDuplicateItem(item.id)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="bg-background/50 rounded p-3 h-32 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("relative h-full bg-background", className)}>
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-surface/40 backdrop-blur-sm border-b border-foreground/10 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === "grid" ? "bg-foreground/10" : "hover:bg-foreground/5"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === "list" ? "bg-foreground/10" : "hover:bg-foreground/5"
              )}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("free")}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === "free" ? "bg-foreground/10" : "hover:bg-foreground/5"
              )}
            >
              <Move className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-2" />
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={cn(
                "p-2 rounded transition-colors",
                showGrid ? "bg-foreground/10" : "hover:bg-foreground/5"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 hover:bg-foreground/5 rounded transition-colors"
            >
              <span className="text-sm">-</span>
            </button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 hover:bg-foreground/5 rounded transition-colors"
            >
              <span className="text-sm">+</span>
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 hover:bg-foreground/5 rounded transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-2" />
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="p-2 hover:bg-foreground/5 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-foreground/5 rounded transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pt-14 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: showGrid
            ? "radial-gradient(circle, #e5e7eb 1px, transparent 1px)"
            : "none",
          backgroundSize: "20px 20px",
        }}
      >
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {items.map((item, index) => (
              <div key={item.id} className="relative">
                {renderCanvasItem({
                  ...item,
                  position: { x: 0, y: 0 },
                })}
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-2 p-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-surface/40 border border-foreground/10 rounded-lg">
                <div className="flex items-center gap-2">
                  {item.type === "chart" && <BarChart3 className="w-4 h-4" />}
                  {item.type === "table" && <Table className="w-4 h-4" />}
                  {item.type === "text" && <Type className="w-4 h-4" />}
                  {item.type === "pdf" && <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(item.id)}
                    className="p-1 hover:bg-foreground/10 rounded"
                  >
                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleDuplicateItem(item.id)}
                    className="p-1 hover:bg-foreground/10 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "free" && (
          <div className="relative w-full h-full">
            {items.map(renderCanvasItem)}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute right-0 top-14 bottom-0 w-80 bg-surface/40 border-l border-foreground/10 p-4 overflow-y-auto"
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Add New Item</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex flex-col items-center gap-1">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">Chart</span>
                  </button>
                  <button className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex flex-col items-center gap-1">
                    <Table className="w-5 h-5" />
                    <span className="text-xs">Table</span>
                  </button>
                  <button className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex flex-col items-center gap-1">
                    <Type className="w-5 h-5" />
                    <span className="text-xs">Text</span>
                  </button>
                  <button className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex flex-col items-center gap-1">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">PDF</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Canvas Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Grid</span>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors",
                        showGrid ? "bg-foreground" : "bg-foreground/20"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 bg-background rounded-full transition-transform",
                          showGrid ? "translate-x-5" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Export Options</h4>
                <div className="space-y-2">
                  <button className="w-full p-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export as Image</span>
                  </button>
                  <button className="w-full p-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
