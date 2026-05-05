import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, AlertTriangle, FileText, ArrowUpRight, Search, Bell, RefreshCw } from 'lucide-react'

export function Dashboard() {
    const [stats, setStats] = useState({
        activePolicies: 0,
        complianceScore: "0%",
        criticalRisks: 0,
        systemUptime: "99.9%",
        recentActivity: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = () => {
        setLoading(true)
        fetch('http://localhost:8001/api/dashboard')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setStats(data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error("Dashboard fetch error:", err)
                setLoading(false)
            })
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12 px-8 relative overflow-hidden font-sans text-slate-600">
            {/* Background Blobs */}
            <div className="payrix-blob-orange -top-20 -right-20 opacity-20"></div>
            <div className="payrix-blob-blue top-1/2 -left-40 opacity-15"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Compliance Overview</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">System Status: {loading ? 'SYNCING...' : 'Operational'}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchStats}
                            className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Active Policies"
                        value={stats.activePolicies}
                        trend={stats.activePolicies > 0 ? "+NEW" : "0"}
                        icon={<FileText className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="Compliance Score"
                        value={stats.complianceScore}
                        icon={<ShieldCheck className="w-5 h-5" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Critical Risks"
                        value={stats.criticalRisks}
                        trend={stats.criticalRisks > 0 ? "+ALERT" : "Stable"}
                        icon={<AlertTriangle className="w-5 h-5" />}
                        color="rose"
                    />
                    <StatCard
                        title="System Uptime"
                        value={stats.systemUptime}
                        trend="Stable"
                        icon={<Activity className="w-5 h-5" />}
                        color="violet"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 text-lg">Recent Activity</h3>
                            <button className="text-xs font-bold text-cyan-500 uppercase tracking-widest hover:text-cyan-600">View All</button>
                        </div>

                        <div className="space-y-4">
                            {stats.recentActivity.length > 0 ? stats.recentActivity.map((act, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-start gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${act.type === 'policy' ? 'bg-blue-50 text-blue-500' : 'bg-rose-50 text-rose-500'}`}>
                                        {act.type === 'policy' ? <FileText className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {act.detail}
                                        </p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / Side Panel */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[80px] opacity-20"></div>

                            <h3 className="font-black text-xl mb-2 relative z-10">Quick Actions</h3>
                            <p className="text-xs text-slate-400 mb-6 relative z-10">Common compliance tasks</p>

                            <div className="space-y-3 relative z-10">
                                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all group">
                                    <span>Upload Policy</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all group">
                                    <span>Run Audit</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all group">
                                    <span>Invite User</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, icon, color }) {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-50',
        emerald: 'text-emerald-500 bg-emerald-50',
        rose: 'text-rose-500 bg-rose-50',
        violet: 'text-violet-500 bg-violet-50',
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : trend.startsWith('-') ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </motion.div>
    )
}
