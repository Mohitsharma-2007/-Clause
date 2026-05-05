import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, FileText, Check, Trash2, Loader2, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Policies() {
    const [policies, setPolicies] = useState([])
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        fetchPolicies()
    }, [])

    async function fetchPolicies() {
        const { data, error } = await supabase.storage.from('policies').list()
        if (data) {
            setPolicies(data)
        } else {
            console.error(error)
        }
    }

    async function uploadFile(file) {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('policies')
                .upload(fileName, file)

            if (uploadError) throw uploadError
            await fetchPolicies()
            alert('Policy ingested successfully.')
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Ingestion failed.')
        } finally {
            setUploading(false)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
        else if (e.type === "dragleave") setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0])
        }
    }

    return (
        <motion.div
            initial={{ x: 100, opacity: 0, filter: 'blur(20px)' }}
            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ x: -100, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
            className="flex-1 overflow-y-auto p-12 bg-[#F8F9FA] min-h-screen pt-32 relative"
        >
            {/* Aurora Decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4ade80]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>

            <header className="mb-16 relative z-10">
                <h1 className="text-7xl font-black text-black tracking-tighter mb-4 leading-none uppercase italic">Repositories.</h1>
                <p className="text-gray-400 font-bold text-lg max-w-2xl">Autonomous governance frameworks and regulatory documentation storage.</p>
            </header>

            <div className="grid grid-cols-12 gap-10 relative z-10">
                {/* Upload Zone - Left */}
                <div className="col-span-12 lg:col-span-4">
                    <motion.div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`group relative h-[600px] rounded-[4rem] border-4 border-dashed transition-all flex flex-col items-center justify-center p-12 text-center overflow-hidden ${dragActive ? "border-[#4ade80] bg-emerald-50 scale-[1.02]" : "border-black/5 bg-white hover:border-black/10 shadow-2xl"
                            }`}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={handleChange}
                            accept=".pdf"
                        />

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-black text-[#4ade80] rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-all mx-auto">
                                {uploading ? <Loader2 className="w-12 h-12 animate-spin" /> : <Upload className="w-12 h-12" />}
                            </div>
                            <h3 className="text-3xl font-black text-black tracking-tight mb-4 leading-none">
                                {uploading ? "Ingesting..." : "Deposit Policy"}
                            </h3>
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest leading-relaxed">
                                PDF DOCUMENT ARCHITECTURE <br />
                                <span className="text-[10px] opacity-60">MAXIMUM PAYLOAD: 50MB</span>
                            </p>
                        </div>

                        {/* Animated Grid nodes when active */}
                        {dragActive && (
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:20px_20px] animate-pulse"></div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Policies List - Right */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white rounded-[4.5rem] shadow-2xl border border-black/5 overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-10 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-2xl font-black text-black uppercase tracking-tight">Active Policies</h3>
                            <div className="bg-black text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
                                {policies.length} Nodes
                            </div>
                        </div>

                        <div className="flex-1 divide-y divide-black/5 overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                                {policies.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30"
                                    >
                                        <FileText className="w-20 h-20 mb-8" />
                                        <p className="font-black text-xl uppercase tracking-widest leading-none">Repository Empty</p>
                                        <p className="text-xs font-bold mt-2">Initialize ingestion to begin monitoring.</p>
                                    </motion.div>
                                ) : (
                                    policies.map((file, index) => (
                                        <motion.div
                                            key={file.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group p-10 hover:bg-gray-50 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-10">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-black text-[#4ade80] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                    <FileText className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-black tracking-tighter mb-1 truncate max-w-md">{file.name}</h4>
                                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>{(file.metadata?.size / 1024).toFixed(1)} KB</span>
                                                        <div className="w-1 h-1 rounded-full bg-black/10"></div>
                                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                        <div className="w-1 h-1 rounded-full bg-black/10 text-emerald-500">•</div>
                                                        <span className="text-emerald-500">Live Verification</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-[#4ade80] transition-all shadow-sm">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <button className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-10 bg-gray-50/50 border-t border-black/5 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Protocol V2.0 Secured Storage</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
