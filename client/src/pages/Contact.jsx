import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Globe, ArrowRight } from 'lucide-react'

export function Contact() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] p-12 pt-48 relative overflow-hidden">
            {/* Aurora Decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4ade80]/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-20 relative z-10">
                {/* Left Column - Info */}
                <div className="col-span-12 lg:col-span-5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-7xl font-black text-black tracking-tighter mb-8 leading-none uppercase italic">Get in <br />Touch.</h1>
                        <p className="text-xl text-gray-500 font-semibold mb-16 leading-relaxed">
                            Questions about regulatory integration? <br />
                            Our technical compliance team is standing by to assist with your deployment.
                        </p>

                        <div className="space-y-12">
                            {[
                                { icon: <MapPin className="w-6 h-6" />, label: 'Global HQ', value: 'One Compliance Plaza, San Francisco, CA' },
                                { icon: <Mail className="w-6 h-6" />, label: 'Secure Email', value: 'protocol@clause.io' },
                                { icon: <Phone className="w-6 h-6" />, label: 'Priority Line', value: '+1 (888) CLAUSE-0' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <div className="w-16 h-16 rounded-2xl bg-black text-[#4ade80] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-xl font-black text-black tracking-tight">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Form */}
                <div className="col-span-12 lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-16 rounded-[4rem] shadow-2xl border border-black/5"
                    >
                        <form className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Full Name</p>
                                    <input
                                        type="text"
                                        placeholder="Alexandra Deff"
                                        className="w-full bg-gray-50 border-none rounded-full py-5 px-8 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Work Email</p>
                                    <input
                                        type="email"
                                        placeholder="alex@clause.io"
                                        className="w-full bg-gray-50 border-none rounded-full py-5 px-8 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Organization</p>
                                <input
                                    type="text"
                                    placeholder="Compliance Corp"
                                    className="w-full bg-gray-50 border-none rounded-full py-5 px-8 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-6">Inquiry Details</p>
                                <textarea
                                    placeholder="Describe your compliance infrastructure requirements..."
                                    rows={5}
                                    className="w-full bg-gray-50 border-none rounded-[2rem] py-6 px-8 font-bold text-black placeholder:text-gray-200 focus:ring-4 focus:ring-[#4ade80]/20 transition-all outline-none resize-none"
                                ></textarea>
                            </div>

                            <button className="w-full bg-black text-[#4ade80] py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl shadow-emerald-500/10 active:scale-95 group">
                                Dispatch Message
                                <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
