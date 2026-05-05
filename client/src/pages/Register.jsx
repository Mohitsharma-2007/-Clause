import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, Shield } from 'lucide-react'

export function Register() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8 relative overflow-hidden">
            {/* Aurora Decoration */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#4ade80]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E8F3EF]/40 rounded-full blur-[80px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg bg-white p-16 rounded-[4rem] shadow-2xl border border-black/5 relative z-10"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-4 italic uppercase">Initialize.</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Register a new compliance entity.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Entity Name</p>
                        <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Alexandra Deff"
                                className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Corporate Email</p>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                placeholder="alex@clause.io"
                                className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Passkey</p>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    type="password"
                                    placeholder="••••"
                                    className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Verify</p>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    type="password"
                                    placeholder="••••"
                                    className="w-full bg-gray-50 border-none rounded-full py-5 pl-16 pr-6 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[2.5rem] mt-4 flex items-start gap-4 border border-black/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#4ade80] shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                            By initializing, you agree to our <span className="text-black">Protocol Standards</span> and <span className="text-black">Data Encryption Policies</span>.
                        </p>
                    </div>

                    <button className="w-full bg-black text-[#4ade80] py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
                        Register Node
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <p className="mt-12 text-center text-gray-400 font-bold text-sm">
                    Already authenticated? <Link to="/login" className="text-black underline underline-offset-4 hover:decoration-[#4ade80] hover:decoration-4 transition-all">Sign In</Link>
                </p>
            </motion.div>
        </div>
    )
}
