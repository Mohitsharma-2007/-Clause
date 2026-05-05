import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Search, Filter, ChevronRight } from 'lucide-react'

export function Violations() {
    const [violations, setViolations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://localhost:8001/api/violations')
            .then(res => res.json())
            .then(data => {
                setViolations(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch violations", err)
                setLoading(false)
            })
    }, [])
    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12 px-8 relative overflow-hidden font-sans text-slate-600">
            {/* Background Blobs */}
            <div className="payrix-blob-teal -bottom-20 right-1/4 opacity-15"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Active Violations</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Compliance Alerts</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="SEARCH_ALERTS..."
                                className="bg-white/50 border border-white rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all w-64 uppercase tracking-widest placeholder:text-slate-300 text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Violations List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Alerts...</div>
                    ) : Array.isArray(violations) && violations.map((v, i) => (
                        <motion.div
                            key={v.id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="payrix-card p-6 border-white bg-white/80 hover:shadow-xl hover:shadow-rose-500/5 transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.severity === 'critical' ? 'bg-rose-50 text-rose-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{v.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Detected in {v.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.status === 'CRITICAL' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 bg-slate-100'}`}>{v.status}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                                    <span className="text-xs font-bold text-slate-600">{v.time}</span>
                                </div>
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-slate-900 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
