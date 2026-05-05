import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Folder, Database, Globe, ArrowRight, Check, Plus, Loader2 } from 'lucide-react'

export function Connectors() {
    const [connecting, setConnecting] = useState(null)
    const [connected, setConnected] = useState(['Google Drive'])

    const connectors = [
        { name: 'Google Drive', icon: <Cloud className="w-8 h-8" />, desc: 'Sync policies and audit evidence from Google Workspace.', color: 'text-blue-500' },
        { name: 'SharePoint', icon: <Folder className="w-8 h-8" />, desc: 'Enterprise-grade integration for Microsoft 365 environments.', color: 'text-emerald-500' },
        { name: 'AWS S3', icon: <Database className="w-8 h-8" />, desc: 'Scalable cloud storage for high-volume policy repositories.', color: 'text-orange-500' },
        { name: 'Custom API', icon: <Globe className="w-8 h-8" />, desc: 'Connect internal systems via our secure REST interface.', color: 'text-purple-500' },
    ]

    const handleConnect = (name) => {
        setConnecting(name)
        setTimeout(() => {
            setConnected(prev => [...prev, name])
            setConnecting(null)
        }, 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 p-12 bg-[#F8F9FA] min-h-screen pt-32 relative"
        >
            {/* Aurora Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ade80]/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>

            <header className="mb-16 relative z-10">
                <h1 className="text-6xl font-black text-black mb-4 tracking-tighter italic uppercase">External Sources</h1>
                <p className="text-gray-400 font-bold text-lg max-w-2xl">Connect your existing data infrastructure to Clause. Our agents will autonomously monitor these sources for policy updates and violations.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 relative z-10">
                {connectors.map((connector, idx) => {
                    const isConnected = connected.includes(connector.name)
                    const isLoading = connecting === connector.name

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[4rem] border-4 transition-all group relative overflow-hidden flex flex-col justify-between h-[450px] ${isConnected
                                    ? 'bg-black border-black shadow-2xl scale-[1.02]'
                                    : 'bg-white border-black/5 hover:border-black/10'
                                }`}
                        >
                            {isConnected && (
                                <div className="absolute top-0 right-0 bg-[#4ade80] text-black px-6 py-2 rounded-bl-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Check className="w-3 h-3" />
                                    Active Stream
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 shadow-xl transition-all group-hover:scale-110 ${isConnected ? 'bg-white/10 text-[#4ade80]' : 'bg-gray-50 text-black'
                                    }`}>
                                    {connector.icon}
                                </div>
                                <h2 className={`text-4xl font-black mb-4 tracking-tighter ${isConnected ? 'text-white' : 'text-black'}`}>
                                    {connector.name}
                                </h2>
                                <p className={`text-xl font-medium leading-relaxed max-w-sm ${isConnected ? 'text-white/40' : 'text-gray-400'}`}>
                                    {connector.desc}
                                </p>
                            </div>

                            <button
                                disabled={isConnected || isLoading}
                                onClick={() => handleConnect(connector.name)}
                                className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all relative z-10 overflow-hidden ${isConnected
                                        ? 'bg-[#4ade80] text-black'
                                        : 'bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Handshaking...
                                    </>
                                ) : isConnected ? (
                                    <>
                                        Configure Stream
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Initialize Link
                                    </>
                                )}
                            </button>

                            {/* Decorative background grid (only if connected) */}
                            {isConnected && (
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:24px_24px]"></div>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
