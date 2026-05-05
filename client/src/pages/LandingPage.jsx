import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Shield,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Layout,
    FileText,
    Eye,
    Activity,
    Lock,
    BarChart3,
    ArrowUpRight,
    Search,
    Brain,
    CloudDownload,
    Cpu,
    Radar,
    ClipboardCheck,
    Globe,
    Zap,
    Users,
    Key,
    ShieldCheck,
    BarChart,
    Settings,
    History,
    MessageSquare,
    Check,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Twitter,
    Github
} from 'lucide-react'

// Layout wrapper for consistent section structure
const Section = ({ children, className = "", id = "" }) => (
    <section id={id} className={`section-padding ${className}`}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </section>
)

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground custom-scrollbar overflow-x-hidden">

            {/* NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-24 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Clause</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Features</Link>
                        <Link to="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">How it Works</Link>
                        <Link to="#use-cases" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Use Cases</Link>
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Sign In</Link>
                        <Link
                            to="/register"
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 1️⃣ HERO SECTION (Above the Fold) */}
            <header className="relative pt-48 pb-20 px-6 lg:px-24 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1 text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Enterprise-Grade Compliance AI</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="h1-premium mb-8"
                        >
                            Enforce Policy. <br />
                            Detect Risk. <br />
                            Stay Compliant.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="body-premium max-w-xl mb-12 text-slate-500"
                        >
                            Clause transforms written policies into enforceable rules and continuously monitors your data to detect violations with clarity and accountability.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10"
                            >
                                Request Demo
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="#how-it-works"
                                className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
                            >
                                View How It Works
                            </Link>
                        </motion.div>
                    </div>

                    {/* HERO RIGHT: Dashboard Preview Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex-1 relative"
                    >
                        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-4 md:p-8 relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="ml-auto flex items-center gap-2">
                                    <div className="w-24 h-2 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Violations</p>
                                    <p className="text-3xl font-bold text-slate-900">4 Active</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rule Engine</p>
                                    <p className="text-3xl font-bold text-slate-900">Live</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-3/4 bg-slate-200 rounded-full mb-2"></div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50 italic text-sm text-slate-500">
                                    "Reference Section 4.2: Data access must be restricted to authenticated managers..."
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-slate-300/10 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            </header>

            {/* 2️⃣ THE PROBLEM SECTION */}
            <Section className="bg-slate-50">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 tracking-tight">
                            Policies Are Written. <br />
                            Risks Are Hidden.
                        </h2>
                        <p className="body-premium mb-8">
                            Organizations rely on written policies to guide operations — but policies are static, while data is constantly changing. Manual reviews are slow, inconsistent, and difficult to audit.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Policies stored as PDFs',
                                'Manual rule interpretation',
                                'Delayed violation detection',
                                'No continuous monitoring',
                                'Limited audit traceability'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="flex flex-col items-center gap-8 py-12 px-8 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
                            <div className="text-center w-full">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="font-bold text-slate-900">Policy Document</p>
                            </div>
                            <div className="w-0.5 h-12 bg-slate-100 border-l border-dashed border-slate-300"></div>
                            <div className="text-center w-full">
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="font-bold text-slate-900">Manual Review</p>
                            </div>
                            <div className="w-0.5 h-12 bg-slate-100 border-l border-dashed border-slate-300"></div>
                            <div className="text-center w-full">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="font-bold text-red-600 uppercase tracking-widest text-sm">Risk Exposure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 3️⃣ THE SOLUTION SECTION */}
            <Section>
                <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 tracking-tight">
                            From Policy Text to Enforceable Control
                        </h2>
                        <p className="body-premium mb-8">
                            Clause converts unstructured policy documents into structured compliance rules and continuously evaluates your operational data against them.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                'Upload policies',
                                'Extract enforceable rules',
                                'Monitor live data',
                                'Flag violations',
                                'Provide clear justifications'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:w-1/2 w-full">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">Policy</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">Rule Engine</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                    <Radar className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">Monitoring</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">Violation Log</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 4️⃣ HOW CLAUSE WORKS (4-STEP PROCESS) */}
            <Section id="how-it-works" className="bg-slate-900 text-white rounded-[4rem] my-20">
                <div className="text-center mb-20 text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">How Clause Operates</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A structured and methodical approach to automated compliance and risk oversight.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {[
                        { step: '01', title: 'Ingest Policies', icon: <CloudDownload size={24} />, desc: 'Upload compliance policies in PDF format. Clause structures and versions them.' },
                        { step: '02', title: 'Extract Rules', icon: <Cpu size={24} />, desc: 'Key requirements are translated into enforceable logic tied to policy clauses.' },
                        { step: '03', title: 'Monitor Data', icon: <Radar size={24} />, desc: 'Clause connects to your database and continuously evaluates records.' },
                        { step: '04', title: 'Review & Report', icon: <ClipboardCheck size={24} />, desc: 'Violations are logged, explained, and available for audit.' }
                    ].map((step, i) => (
                        <div key={i} className="relative">
                            <div className="text-emerald-500 font-bold text-5xl opacity-20 mb-6">{step.step}</div>
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* 5️⃣ CORE FEATURES SECTION */}
            <Section id="features">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Built for Modern Compliance Teams</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'Policy Intelligence', icon: <Brain />, desc: 'Structured rule extraction with version control.' },
                        { title: 'Continuous Monitoring', icon: <Activity />, desc: 'Automated evaluation of records in real time.' },
                        { title: 'Explainable Violations', icon: <MessageSquare />, desc: 'Each flagged record links directly to the triggering clause.' },
                        { title: 'Review Workflow', icon: <CheckCircle2 />, desc: 'Approve, dismiss, assign, and document actions.' },
                        { title: 'Audit Trail', icon: <History />, desc: 'Full traceability of every review and change.' },
                        { title: 'Reporting & Analytics', icon: <BarChart />, desc: 'Export-ready compliance summaries and risk trends.' },
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-4 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* 6️⃣ USE CASES SECTION */}
            <Section id="use-cases" className="bg-slate-50">
                <div className="mb-20 text-left md:text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Designed for Operational Oversight</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: 'Corporate Governance', desc: 'Enforce internal business rules automatically across all departments.' },
                        { title: 'Data Protection', desc: 'Monitor sensitive access patterns and flag abnormal behaviors instantly.' },
                        { title: 'Operational Controls', desc: 'Ensure day-to-day processes align with complex policy standards.' },
                        { title: 'Regulatory Oversight', desc: 'Prepare structured, audit-ready reports for external regulators.' },
                    ].map((useCase, i) => (
                        <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex items-start gap-8">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900">{useCase.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{useCase.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* 7️⃣ PRODUCT INTERFACE PREVIEW */}
            <Section>
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Clarity at Every Level</h2>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-4 md:p-12 overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px]"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl"></div>
                                        <div className="h-4 w-48 bg-slate-100 rounded-full"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg"></div>
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl"></div>)}
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-slate-50 rounded-full w-full"></div>)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-white">
                                <h4 className="font-bold mb-6 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Rule Config
                                </h4>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                            <div className="h-2 w-24 bg-slate-600 rounded-full"></div>
                                            <div className="w-8 h-4 bg-emerald-500/50 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-white">
                                <h4 className="font-bold mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-400" />
                                    Risk Trends
                                </h4>
                                <div className="h-32 flex items-end gap-2">
                                    {[20, 40, 60, 30, 80, 50, 90].map((h, i) => (
                                        <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-blue-500/30 rounded-t-sm"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-slate-400 mt-12 italic text-sm">Designed for clarity, precision, and accountability.</p>
            </Section>

            {/* 8️⃣ TRUST & SECURITY SECTION */}
            <Section className="bg-slate-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-slate-900">Built for Secure Environments</h2>
                    <p className="body-premium mb-12">
                        Compliance requires trust. Clause is engineered with security-first architecture to ensure your data and rules remain protected and auditable.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { title: 'RBAC', icon: <Users />, desc: 'Role-based access' },
                            { title: 'Encryption', icon: <Lock />, desc: 'AES-256 data handling' },
                            { title: 'Audit Logs', icon: <History />, desc: 'Every action traced' },
                            { title: 'Controlled', icon: <Settings />, desc: 'Rule activation gates' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-sm mb-4 border border-slate-100">
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                <p className="text-xs text-slate-400 font-semibold uppercase">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* 9️⃣ DIFFERENTIATION SECTION */}
            <Section>
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center tracking-tight text-slate-900">Structured Enforcement, Not Just Monitoring</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[3rem] overflow-hidden border border-slate-200">
                        <div className="p-12 bg-slate-50 border-r border-slate-200">
                            <h4 className="text-2xl font-bold mb-8 text-slate-400 italic">Manual Review</h4>
                            <ul className="space-y-6">
                                {['Inconsistent results', 'Reactive risk management', 'Difficult to audit & trace'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-400 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-12 bg-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                            <h4 className="text-2xl font-bold mb-8 text-emerald-700">Clause AI</h4>
                            <ul className="space-y-6">
                                {['Automated extraction', 'Continuous evaluation', 'Traceable accountability', 'Structured controls'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-900 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 🔟 FINAL CTA SECTION */}
            <Section className="pb-40">
                <div className="bg-emerald-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                            Bring Structure to Your <br />
                            Compliance Program
                        </h2>
                        <p className="text-emerald-100/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                            Turn policies into operational controls with clarity and accountability. Start your journey towards autonomous compliance today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-white text-emerald-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl"
                            >
                                Schedule a Consultation
                            </Link>
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto bg-emerald-800 text-white border border-emerald-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all"
                            >
                                Explore the Platform
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6 lg:px-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">Clause</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm mb-8">
                            Transforming unstructured policies into automated, enforceable operational controls.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Twitter size={18} /></Link>
                            <Link className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Linkedin size={18} /></Link>
                            <Link className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Github size={18} /></Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link className="hover:text-primary transition-colors">How it Works</Link></li>
                            <li><Link className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link className="hover:text-primary transition-colors">Use Cases</Link></li>
                            <li><Link className="hover:text-primary transition-colors">Security</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li className="flex items-center gap-2"><Mail size={14} /> demo@clause.ai</li>
                            <li className="flex items-center gap-2"><Phone size={14} /> +1 (888) 123-4567</li>
                            <li className="flex items-center gap-2"><MapPin size={14} /> San Francisco, CA</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-slate-50 pt-10 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <p>© 2026 Clause AI. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link className="hover:text-slate-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
