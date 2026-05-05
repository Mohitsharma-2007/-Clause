import { Navbar } from './Navbar'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export function Layout({ children }) {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="min-h-screen relative z-10 flex flex-col">
                {children}
            </main>

            {/* Global Grain/Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-50 mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}>
            </div>
        </div>
    )
}
