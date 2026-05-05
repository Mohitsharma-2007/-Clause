import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react'

export function Login() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8 relative overflow-hidden">
            {/* Aurora Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ade80]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8F3EF]/40 rounded-full blur-[80px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg bg-white p-16 rounded-[4rem] shadow-2xl border border-black/5 relative z-10"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-4 italic italic uppercase">Identify.</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Access your compliance node.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Deployment Email</p>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                placeholder="alex@clause.io"
                                className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Access Key</p>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pr-4">
                        <button className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-black transition-colors">
                            Forgot Authentication?
                        </button>
                    </div>

                    <button className="w-full bg-black text-[#4ade80] py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
                        Establish Connection
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-12 pt-12 border-t border-black/5">
                    <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8">Federated Identity</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-gray-50 text-black py-4 rounded-full flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all group font-black text-[10px] uppercase tracking-widest">
                            <Github className="w-4 h-4" />
                            GitHub
                        </button>
                        <button className="bg-gray-50 text-black py-4 rounded-full flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all group font-black text-[10px] uppercase tracking-widest">
                            <Chrome className="w-4 h-4" />
                            Google
                        </button>
                    </div>
                </div>

                <p className="mt-12 text-center text-gray-400 font-bold text-sm">
                    New to the network? <Link to="/register" className="text-black underline underline-offset-4 hover:decoration-[#4ade80] hover:decoration-4 transition-all">Register Node</Link>
                </p>
            </motion.div>
        </div>
    )
}
