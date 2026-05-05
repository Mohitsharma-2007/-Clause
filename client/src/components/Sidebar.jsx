import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Database, ShieldAlert, FileText, Bot, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export function Sidebar() {
    const location = useLocation()

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Knowledge Vault', path: '/vault', icon: <Database className="w-5 h-5" /> },
        { name: 'Violations', path: '/violations', icon: <ShieldAlert className="w-5 h-5" /> },
        { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
        { name: 'Assistant', path: '/assistant', icon: <Bot className="w-5 h-5" /> },
    ]

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('clause_onboarding')
            window.location.href = '/'
        }
    }

    return (
        <div className="w-64 fixed left-0 top-0 bottom-0 z-50 p-6 flex flex-col justify-between pointer-events-none">
            {/* Glass Container */}
            <div className="absolute inset-0 m-4 rounded-[2.5rem] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden">
                {/* Logo Area */}
                <div className="p-8 pt-10">
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">Clause</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Autonomous Compliance</p>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 space-y-2 mt-4">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link to={link.path} key={link.path}>
                                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive ? 'bg-white/10 text-white shadow-lg shadow-[#4ade80]/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80] rounded-r-full shadow-[0_0_10px_#4ade80]"></div>}
                                    <div className={`${isActive ? 'text-[#4ade80]' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
                                        {link.icon}
                                    </div>
                                    <span className="text-sm font-bold tracking-wide">{link.name}</span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-all text-xs font-bold uppercase tracking-widest group"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </button>
                    <p className="text-[9px] text-center text-slate-600 mt-4 font-mono">v2.4.0-stable</p>
                </div>
            </div>
        </div>
    )
}
