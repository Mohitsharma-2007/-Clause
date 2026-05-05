import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, LayoutDashboard, ShieldCheck, AlertTriangle, Link2, FileBarChart, Database } from 'lucide-react'

const navItems = [
    { label: 'Assistant', href: '/assistant', icon: <Bot className="w-4 h-4" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Knowledge Vault', href: '/vault', icon: <Database className="w-4 h-4" /> },
    { label: 'Violations', href: '/violations', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'Reports', href: '/reports', icon: <FileBarChart className="w-4 h-4" /> },
]

export function Navbar() {
    const location = useLocation()

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full px-8 flex justify-center"
        >
            <div className="bg-white/80 backdrop-blur-2xl px-3 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/40 ring-1 ring-black/[0.03]">
                <Link to="/" className="px-6 py-2.5 bg-black text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transform hover:scale-105 transition-all shadow-xl shadow-black/20 mr-4">
                    Clause
                </Link>

                <nav className="hidden xl:flex items-center gap-1">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.href
                                ? 'bg-black text-white shadow-lg'
                                : 'text-gray-400 hover:text-black hover:bg-black/5'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="h-6 w-[1px] bg-black/5 mx-4 hidden xl:block"></div>

                <div className="flex items-center gap-1">
                    {/* Auth Section */}
                    <Link
                        to="/login"
                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/contact"
                        className="bg-[#4ade80] text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-all transform hover:scale-105"
                    >
                        Contact
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
