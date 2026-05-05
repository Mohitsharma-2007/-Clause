"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Search, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, X, Eye, Share2, Trash2, Edit, Copy, Highlighter, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  documentId: string;
  filename: string;
  url: string;
  onClose?: () => void;
  onExtract?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export default function PDFViewer({
  documentId,
  filename,
  url,
  onClose,
  onExtract,
  onDelete,
  onShare,
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfInstance, setPdfInstance] = useState<any>(null);

  useEffect(() => {
    loadPDF();
  }, [url]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you would use PDF.js here
      // For now, we'll simulate the PDF loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTotalPages(10); // Simulated page count
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load PDF");
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleAddAnnotation = (type: string) => {
    const newAnnotation = {
      id: Date.now(),
      type,
      page: currentPage,
      x: 100,
      y: 100,
      content: "",
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const renderPDFPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div
          className="bg-white border border-foreground/10 rounded-lg shadow-lg overflow-hidden"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
          }}
        >
          <div className="w-[600px] h-[800px] bg-gray-100 flex items-center justify-center">
            <div className="text-center p-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">{filename}</p>
              <p className="text-sm text-gray-500">Page {currentPage}</p>
              <div className="mt-8 p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  This is a simulated PDF viewer. In production, this would render the actual PDF content
                  using PDF.js or a similar library. The viewer supports zoom, rotation, search,
                  annotations, and various file operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm",
      isFullscreen && "bg-black"
    )}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-surface/40">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-medium">{filename}</h3>
              <p className="text-sm text-muted-foreground">
                {totalPages} pages • {(Math.random() * 2 + 0.5).toFixed(1)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={cn(
                "p-2 hover:bg-foreground/10 rounded-full transition-colors",
                showAnnotations && "bg-foreground/10"
              )}
              title="Annotations"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              onClick={onExtract}
              className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              title="Extract Text"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onShare}
              className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open(url, '_blank')}
              className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              title="Fullscreen"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-surface/20">
          <div className="flex items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[80px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in document..."
                className="pl-10 pr-4 py-2 bg-surface/60 border border-foreground/10 rounded-full text-sm focus:outline-none focus:border-foreground/30"
              />
            </div>
            {searchResults.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {currentSearchIndex + 1} / {searchResults.length}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-center">
            {renderPDFPage()}
          </div>
        </div>

        {/* Annotations Panel */}
        <AnimatePresence>
          {showAnnotations && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-surface/40 border-l border-foreground/10 p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Annotations</h4>
                <button
                  onClick={() => setShowAnnotations(false)}
                  className="p-1 hover:bg-foreground/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleAddAnnotation('highlight')}
                  className="w-full p-2 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
                >
                  <Highlighter className="w-4 h-4 inline mr-2" />
                  Add Highlight
                </button>
                <button
                  onClick={() => handleAddAnnotation('note')}
                  className="w-full p-2 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Add Note
                </button>
              </div>

              <div className="space-y-3">
                {annotations.map((annotation) => (
                  <div key={annotation.id} className="p-3 bg-surface/60 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Page {annotation.page}
                      </span>
                      <button className="p-1 hover:bg-foreground/10 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm">{annotation.content || 'Empty annotation'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
