import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Rocket,
    User,
    Building2,
    Upload,
    Users,
    Brain,
    CheckCircle2,
    ArrowRight,
    Plus,
    X,
    Search,
    Scale,
    ShieldCheck,
    Globe,
    FileText,
    Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import industriesData from '../data/industries.json'

// --- Step 1: User Profile ---
const StepProfile = ({ onNext, data, setData }) => {
    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Welcome to Clause</h2>
                <p className="text-slate-500 font-medium mt-2">Let's start with your professional profile.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. Sarah Connor"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                            value={data.name || ''}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Job Title</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. Compliance Officer"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                            value={data.role || ''}
                            onChange={(e) => setData({ ...data, role: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!data.name || !data.role}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 mt-4 flex items-center justify-center gap-2"
            >
                Continue <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    )
}

// --- Step 2: Organization Context ---
const StepOrg = ({ onNext, data, setData }) => {
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState([])
    const scales = ['1-50', '51-200', '201-1000', '1000+']

    useEffect(() => {
        if (search.length > 0) {
            setFiltered(industriesData.filter(i =>
                i.industry.toLowerCase().includes(search.toLowerCase())
            ).slice(0, 5))
        } else {
            setFiltered([])
        }
    }, [search])

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Organization Setup</h2>
                <p className="text-slate-500 font-medium mt-2">Tailor the compliance engine to your company.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Industry Search */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Industry Sector</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Industry..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            value={data.industry?.industry || search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                if (!e.target.value) setData({ ...data, industry: null })
                            }}
                        />
                        {filtered.length > 0 && !data.industry && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                {filtered.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setData({ ...data, industry: item })
                                            setSearch('')
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0"
                                    >
                                        {item.industry}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {data.industry && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" /> Selected: {data.industry.industry}
                            <button onClick={() => setData({ ...data, industry: null })} className="ml-auto text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>

                {/* Scale Selection */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Company Size</label>
                    <div className="grid grid-cols-2 gap-3">
                        {scales.map(s => (
                            <button
                                key={s}
                                onClick={() => setData({ ...data, scale: s })}
                                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${data.scale === s
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-cyan-400'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={onNext}
                    disabled={!data.industry || !data.scale}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

// --- Step 3: Quick Connect (Upload) ---
const StepConnect = ({ onNext, data, setData }) => {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        // Simulate upload delay
        setTimeout(() => {
            setUploading(false)
            setData({ ...data, uploaded_file: file.name })
            // onNext() // Auto advance or let user click
        }, 1500)

        // In real app: await supabase.storage.from('documents').upload(...)
    }

    return (
        <div className="space-y-8 max-w-xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Quick Connect</h2>
                <p className="text-slate-500 font-medium mt-2">Upload your first policy document to jumpstart the AI.</p>
            </div>

            <div
                className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer ${data.uploaded_file ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-cyan-500 hover:bg-white/80'
                    }`}
                onClick={() => !data.uploaded_file && fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                        <p className="font-bold text-slate-900"> analyzing document structure...</p>
                    </div>
                ) : data.uploaded_file ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{data.uploaded_file}</h3>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2">Ready for Processing</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setData({ ...data, uploaded_file: null }) }}
                            className="mt-6 text-xs text-slate-400 hover:text-rose-500 underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-cyan-500">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Upload Policy PDF</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Drag & drop or click to browse</p>
                    </>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onNext}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Skip for Now
                </button>
                <button
                    onClick={onNext}
                    disabled={!data.uploaded_file}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

// --- Step 4: Team Invite ---
const StepInvite = ({ onNext, data, setData }) => {
    const [email, setEmail] = useState('')
    const [invites, setInvites] = useState([])

    const addInvite = (e) => {
        e.preventDefault()
        if (email && !invites.includes(email)) {
            setInvites([...invites, email])
            setEmail('')
            setData({ ...data, invites: [...invites, email] })
        }
    }

    const removeInvite = (emailToRemove) => {
        const newInvites = invites.filter(i => i !== emailToRemove)
        setInvites(newInvites)
        setData({ ...data, invites: newInvites })
    }

    return (
        <div className="space-y-8 max-w-xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Invite Team</h2>
                <p className="text-slate-500 font-medium mt-2">Compliance is a team sport. Add your colleagues.</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                <form onSubmit={addInvite} className="relative">
                    <input
                        type="email"
                        placeholder="colleague@company.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!email}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-0"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </form>

                <div className="space-y-2">
                    {invites.length === 0 && (
                        <div className="text-center text-slate-300 text-xs italic py-4">No invitations added yet.</div>
                    )}
                    {invites.map((inv, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{inv}</span>
                            </div>
                            <button onClick={() => removeInvite(inv)} className="text-slate-400 hover:text-rose-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
                {invites.length > 0 ? `Invite ${invites.length} Members & Continue` : 'Skip for Now'} <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    )
}

// --- Step 5: Persona (Existing Logic) ---
const StepPersona = ({ onComplete, data, setData }) => {
    const personas = [
        { id: 'auditor', label: 'Strict Auditor', desc: 'Precise, rule-bound, focuses on violations.', icon: ShieldCheck },
        { id: 'assistant', label: 'Helpful Assistant', desc: 'Educational, collaborative, explains complex terms.', icon: Brain },
        { id: 'strategist', label: 'Risk Strategist', desc: 'Focuses on long-term liability and business impact.', icon: Globe },
    ]

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">AI Personality</h2>
                <p className="text-slate-500 font-medium mt-2">How should Clause AI interact with your team?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {personas.map((p) => {
                    const Icon = p.icon
                    const isSelected = data.persona === p.id
                    return (
                        <button
                            key={p.id}
                            onClick={() => {
                                setData({ ...data, persona: p.id })
                                // Auto-advance after selection
                                setTimeout(() => onComplete({ ...data, persona: p.id }), 400)
                            }}
                            className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-6 text-left group ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-cyan-300 hover:shadow-lg'
                                }`}
                        >
                            <div className={`p-3 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-slate-50'}`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h4 className={`font-black text-lg ${isSelected ? 'text-white' : 'text-slate-900'}`}>{p.label}</h4>
                                <p className={`text-sm font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                            </div>
                            <div className="ml-auto">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-cyan-500' : 'border-slate-200'}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-cyan-500" />}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// --- Main Container ---
export function Onboarding() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        industry: null,
        scale: null,
        uploaded_file: null,
        invites: [],
        persona: null
    })

    const handleComplete = async (finalData) => {
        // Save to Supabase / LocalStorage
        console.log("Onboarding Complete:", finalData)
        localStorage.setItem('clause_onboarding', JSON.stringify(finalData))

        // Simulating API call
        await new Promise(r => setTimeout(r, 800))
        navigate('/')
    }

    const steps = [
        { id: 1, component: StepProfile },
        { id: 2, component: StepOrg },
        { id: 3, component: StepConnect },
        { id: 4, component: StepInvite },
        { id: 5, component: StepPersona },
    ]

    const CurrentStep = steps.find(s => s.id === step)?.component || StepProfile

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden p-6 font-sans">
            {/* Background Elements */}
            <div className="payrix-blob-orange top-0 right-0 opacity-10"></div>
            <div className="payrix-blob-blue bottom-0 left-0 opacity-10"></div>

            <div className="w-full max-w-4xl bg-white/40 border border-white/50 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative z-10 min-h-[700px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Clause AI</span>
                            <span className="block text-xs font-bold text-slate-900">System Setup</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        {steps.map(s => (
                            <div
                                key={s.id}
                                className={`h-1.5 rounded-full transition-all duration-500 ${s.id <= step ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <CurrentStep
                                onNext={() => setStep(step + 1)}
                                onComplete={handleComplete}
                                data={formData}
                                setData={setFormData}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
