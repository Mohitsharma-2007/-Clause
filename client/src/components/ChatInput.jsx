import { useState } from 'react'

export function ChatInput({ onSend, loading, value, onChange }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (value.trim()) onSend()
        }
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto group">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-green-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="
         relative bg-[#021f10]/80 backdrop-blur-3xl 
         border border-[#22c55e]/40 rounded-[2rem] h-20
         shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)]
         flex items-center px-8
         ring-1 ring-white/10 focus-within:ring-[#4ade80]/60 
         transition-all duration-300
         overflow-hidden
      ">
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22c55e]/5 to-transparent pointer-events-none"></div>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="What do you want to know?"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-400/80 text-xl font-medium tracking-wide"
                />

                <button
                    onClick={onSend}
                    disabled={!value.trim() || loading}
                    className={`
             w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ml-4
             ${value.trim() && !loading
                            ? 'bg-white text-black hover:scale-110 shadow-lg'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'}
          `}
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
