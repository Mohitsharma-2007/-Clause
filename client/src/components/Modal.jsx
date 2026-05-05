import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col z-10"
                    >
                        <div className="p-10 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                            <h3 className="text-3xl font-black text-black tracking-tight">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black border border-transparent hover:border-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 pt-4 overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
