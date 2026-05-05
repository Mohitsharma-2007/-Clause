import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Filter, Search, BarChart3, PieChart, TrendingUp, AlertTriangle } from 'lucide-react'

export function Reports() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://localhost:8001/api/reports')
            .then(res => res.json())
            .then(data => {
                setReports(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])
    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12 px-8 relative overflow-hidden font-sans text-slate-600">
            {/* Background Blobs */}
            <div className="payrix-blob-orange -top-20 -right-20 opacity-20"></div>
            <div className="payrix-blob-blue top-1/2 -left-40 opacity-15"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Compliance Reports</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Generate & Export Analysis</p>
                    </div>
                </div>

                {/* Content Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Reports...</div>
                    ) : Array.isArray(reports) && reports.map((report, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="payrix-card p-6 border-white bg-white/60 hover:shadow-xl transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all ${report.icon === 'bar-chart' ? 'bg-blue-50 text-blue-500' :
                                report.icon === 'pie-chart' ? 'bg-emerald-50 text-emerald-500' :
                                    'bg-rose-50 text-rose-500'
                                }`}>
                                {report.icon === 'bar-chart' ? <BarChart3 className="w-6 h-6" /> :
                                    report.icon === 'pie-chart' ? <PieChart className="w-6 h-6" /> :
                                        <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{report.title}</h3>
                            <p className="text-xs text-slate-500 mb-4">{report.description}</p>
                            <button className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${report.icon === 'bar-chart' ? 'text-blue-500 hover:text-blue-600' :
                                report.icon === 'pie-chart' ? 'text-emerald-500 hover:text-emerald-600' :
                                    'text-rose-500 hover:text-rose-600'
                                }`}>
                                {report.type === 'audit' ? 'Download PDF' : report.type === 'risk' ? 'View Analytics' : 'Export CSV'}
                                {report.type === 'audit' ? <Download className="w-3 h-3" /> : report.type === 'risk' ? <TrendingUp className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
