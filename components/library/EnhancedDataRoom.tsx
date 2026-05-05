"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  Eye,
  Download,
  Share2,
  Edit,
  Copy,
  Filter,
  Grid3X3,
  List,
  FolderPlus,
  Tag,
  Calendar,
  User,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  X,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import PDFViewer from "../pdf/PDFViewer";

type DocRow = {
  id: string;
  filename: string;
  kind: string | null;
  doc_year: number | null;
  doc_month: number | null;
  doc_date: string | null;
  summary: string | null;
  size_bytes: number | null;
  status: "pending" | "processing" | "ready" | "error";
  created_at: string;
  url?: string;
  tags?: string[];
  shared_with?: string[];
  owner?: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FILE_ICONS = {
  default: FileText,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  image: FileImage,
  video: FileVideo,
  archive: FileArchive,
};

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  ready: CheckCircle,
  error: XCircle,
};

const STATUS_COLORS = {
  pending: "text-yellow-500",
  processing: "text-blue-500",
  ready: "text-green-500",
  error: "text-red-500",
};

export default function EnhancedDataRoom() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ name: string; phase: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "status">("date");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKind, setFilterKind] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocRow | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Load failed");
      setDocs(json.documents ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError("Not signed in. Refresh and sign in again.");
      return;
    }

    for (const file of list) {
      setError(null);
      try {
        setUploading({ name: file.name, phase: "Uploading" });
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const storagePath = `${userId}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("clause-files")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (upErr) throw upErr;

        setUploading({ name: file.name, phase: "Processing" });
        const { data: { publicUrl } } = supabase.storage
          .from("clause-files")
          .getPublicUrl(storagePath);

        const extractRes = await fetch("/api/documents/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: publicUrl, filename: file.name }),
        });
        if (!extractRes.ok) throw new Error("Extract failed");
        await extractRes.json();

        await refresh();
      } catch (e) {
        setError(`Failed to upload ${file.name}: ${(e as Error).message}`);
      } finally {
        setUploading(null);
      }
    }
  }, [refresh]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleShare = async (docId: string) => {
    try {
      // Implement share functionality
      console.log("Sharing document:", docId);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDownload = async (doc: DocRow) => {
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FILE_ICONS.pdf;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return FILE_ICONS.spreadsheet;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return FILE_ICONS.image;
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return FILE_ICONS.video;
    if (['zip', 'rar', '7z'].includes(ext || '')) return FILE_ICONS.archive;
    return FILE_ICONS.default;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const filteredAndSortedDocs = docs
    .filter(doc => {
      const matchesSearch = doc.filename.toLowerCase().includes(search.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
      const matchesKind = filterKind === "all" || doc.kind === filterKind;
      return matchesSearch && matchesStatus && matchesKind;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.filename.localeCompare(b.filename);
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "size":
          return (b.size_bytes || 0) - (a.size_bytes || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedDocs.map((doc) => {
        const Icon = getFileIcon(doc.filename);
        const StatusIcon = STATUS_ICONS[doc.status];
        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative group bg-surface/40 border border-foreground/10 rounded-lg p-4 hover:border-foreground/25 transition-all cursor-pointer",
              selectedDocs.includes(doc.id) && "ring-2 ring-foreground/50"
            )}
            onClick={() => setPreviewDoc(doc)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-foreground/5 rounded-lg">
                <Icon className="w-6 h-6 text-foreground/60" />
              </div>
              <div className="flex items-center gap-1">
                <StatusIcon className={cn("w-4 h-4", STATUS_COLORS[doc.status])} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDocs(prev => 
                      prev.includes(doc.id) 
                        ? prev.filter(id => id !== doc.id)
                        : [...prev, doc.id]
                    );
                  }}
                  className={cn(
                    "p-1 rounded transition-colors",
                    selectedDocs.includes(doc.id) ? "bg-foreground/20" : "hover:bg-foreground/10"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded border border-foreground/40",
                    selectedDocs.includes(doc.id) && "bg-foreground"
                  )} />
                </button>
              </div>
            </div>

            <h3 className="font-medium text-sm mb-1 truncate">{doc.filename}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {doc.summary || "No summary available"}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(doc.size_bytes)}</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>

            {doc.kind && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-foreground/10 rounded text-xs">
                  {doc.kind}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(doc);
                }}
                className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(doc.id);
                }}
                className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc.id);
                }}
                className="p-2 bg-background/80 rounded-full hover:bg-red-500 transition-colors text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedDocs.map((doc) => {
        const Icon = getFileIcon(doc.filename);
        const StatusIcon = STATUS_ICONS[doc.status];
        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-4 p-4 bg-surface/40 border border-foreground/10 rounded-lg hover:border-foreground/25 transition-all cursor-pointer",
              selectedDocs.includes(doc.id) && "ring-2 ring-foreground/50"
            )}
            onClick={() => setPreviewDoc(doc)}
          >
            <div className="p-2 bg-foreground/5 rounded-lg">
              <Icon className="w-5 h-5 text-foreground/60" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{doc.filename}</h3>
                <StatusIcon className={cn("w-4 h-4", STATUS_COLORS[doc.status])} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {doc.summary || "No summary available"}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium">{formatFileSize(doc.size_bytes)}</div>
              <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
            </div>

            <div className="flex items-center gap-2">
              {doc.kind && (
                <span className="px-2 py-1 bg-foreground/10 rounded text-xs">
                  {doc.kind}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocs(prev => 
                    prev.includes(doc.id) 
                      ? prev.filter(id => id !== doc.id)
                      : [...prev, doc.id]
                  );
                }}
                className={cn(
                  "p-1 rounded transition-colors",
                  selectedDocs.includes(doc.id) ? "bg-foreground/20" : "hover:bg-foreground/10"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded border border-foreground/40",
                  selectedDocs.includes(doc.id) && "bg-foreground"
                )} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(doc);
                }}
                className="p-1 hover:bg-foreground/10 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(doc.id);
                }}
                className="p-1 hover:bg-foreground/10 rounded transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc.id);
                }}
                className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-foreground/10 bg-surface/40 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Data Room</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters ? "bg-foreground/10" : "hover:bg-foreground/5"
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            {selectedDocs.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-foreground/10 rounded-full">
                <span className="text-sm">{selectedDocs.length} selected</span>
                <button
                  onClick={() => setSelectedDocs([])}
                  className="p-1 hover:bg-foreground/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 pt-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
                >
                  <option value="all">All Status</option>
                  <option value="ready">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
                
                <select
                  value={filterKind}
                  onChange={(e) => setFilterKind(e.target.value)}
                  className="px-3 py-2 bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
                >
                  <option value="all">All Types</option>
                  <option value="Policy">Policy</option>
                  <option value="Statement">Statement</option>
                  <option value="Contract">Contract</option>
                  <option value="KYC">KYC</option>
                  <option value="Ledger">Ledger</option>
                  <option value="Report">Report</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 m-4 text-center transition-colors",
          dragActive ? "border-foreground bg-foreground/5" : "border-foreground/20"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-2">
            {uploading ? `Uploading ${uploading.name}...` : "Drop files here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOC, DOCX, TXT, XLSX, XLS, CSV up to 50MB
          </p>
        </label>
      </div>

      {/* Documents */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        ) : filteredAndSortedDocs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          </div>
        ) : (
          viewMode === "grid" ? renderGridView() : renderListView()
        )}
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {previewDoc && (
          <PDFViewer
            documentId={previewDoc.id}
            filename={previewDoc.filename}
            url={previewDoc.url || ""}
            onClose={() => setPreviewDoc(null)}
            onExtract={() => {
              // Handle text extraction
              console.log("Extracting text from:", previewDoc.filename);
            }}
            onShare={() => handleShare(previewDoc.id)}
            onDelete={() => {
              handleDelete(previewDoc.id);
              setPreviewDoc(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
