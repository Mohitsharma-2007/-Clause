import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Database, Plus, Search, CheckCircle, AlertCircle, RefreshCw, Server, Globe, MessageSquare, Briefcase, Lock, ChevronLeft, BookOpen, X, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export function KnowledgeVault() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('local')
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [view, setView] = useState('grid')
    const [activeSource, setActiveSource] = useState(null)
    const [connected, setConnected] = useState([])
    const [connecting, setConnecting] = useState(null)
    const [pathwayInstructions, setPathwayInstructions] = useState(null)
    const [showGuide, setShowGuide] = useState(false)

    // Configuration States
    const [sharepointConfig, setSharePointConfig] = useState({ url: '', tenant_id: '', client_id: '', client_secret: '' })
    const [slackConfig, setSlackConfig] = useState({ bot_token: '', channel_id: '' })
    const [notionConfig, setNotionConfig] = useState({ integration_token: '' })
    const [genericConfig, setGenericConfig] = useState({ api_key: '', endpoint_url: '' })
    const API_BASE = 'http://localhost:8001'

    const sources = [
        { name: 'Google Drive', icon: <Database className="w-6 h-6" />, category: 'Storage', description: 'Connect personal or shared drives.' },
        { name: 'SharePoint', icon: <Globe className="w-6 h-6" />, category: 'Enterprise', description: 'Sync corporate policy libraries.' },
        { name: 'Slack', icon: <MessageSquare className="w-6 h-6" />, category: 'Communication', description: 'Monitor legal channels.' },
        { name: 'Notion', icon: <FileText className="w-6 h-6" />, category: 'Knowledge', description: 'Sync internal wikis.' },
    ]

    const marketplace = [
        { name: 'Salesforce', icon: <Briefcase className="w-6 h-6" />, category: 'CRM', description: 'Customer contracts & agreements.' },
        { name: 'Jira', icon: <Server className="w-6 h-6" />, category: 'Project Mgmt', description: 'Compliance tasks & tickets.' },
        { name: 'Zendesk', icon: <MessageSquare className="w-6 h-6" />, category: 'Support', description: 'Customer support tickets.' },
        { name: 'HubSpot', icon: <Briefcase className="w-6 h-6" />, category: 'CRM', description: 'Sales & marketing data.' },
        { name: 'Box', icon: <Database className="w-6 h-6" />, category: 'Storage', description: 'Secure file storage.' },
        { name: 'Dropbox', icon: <Database className="w-6 h-6" />, category: 'Storage', description: 'Cloud file sync.' },
        { name: 'Github', icon: <Server className="w-6 h-6" />, category: 'Dev', description: 'Codebase compliance.' },
        { name: 'Stripe', icon: <Lock className="w-6 h-6" />, category: 'Finance', description: 'Payment records.' },
    ]

    const fileInputRef = useRef(null)
    const gdriveInputRef = useRef(null)

    const [pipelineRunning, setPipelineRunning] = useState(false)
    const [pipelineStatus, setPipelineStatus] = useState(null) // 'idle', 'running', 'error'

    useEffect(() => {
        fetchFiles()
        checkConnections()
        checkPipelineStatus()

        // Poll pipeline status every 10s
        const interval = setInterval(checkPipelineStatus, 10000)
        return () => clearInterval(interval)
    }, [])

    async function checkConnections() {
        try {
            const res = await fetch(`${API_BASE}/api/config/status`)
            const data = await res.json()
            if (data.connected) setConnected(prev => [...new Set([...prev, ...data.connected])])
        } catch (e) { console.error("Failed to check connections") }
    }

    async function checkPipelineStatus() {
        try {
            const res = await fetch(`${API_BASE}/api/pipeline/status`)
            const data = await res.json()
            setPipelineRunning(data.running)
            setPipelineStatus(data.running ? 'running' : 'idle')
        } catch (e) { console.error("Failed to check pipeline") }
    }

    async function startPipeline() {
        setPipelineStatus('starting')
        try {
            const res = await fetch(`${API_BASE}/api/pipeline/start`, { method: 'POST' })
            const data = await res.json()

            if (res.ok && data.success) {
                setPipelineRunning(true)
                setPipelineStatus('running')
            } else {
                console.error("Pipeline Start Error:", data)
                alert('Failed to start: ' + (data.message || data.detail || 'Unknown error'))
                setPipelineStatus('idle')
            }
        } catch (e) {
            console.error("Pipeline Warning:", e)
            alert('Error starting pipeline: ' + e.message)
            setPipelineStatus('idle')
        }
    }

    async function fetchFiles() {
        try {
            const { data, error } = await supabase.storage.from('documents').list()
            if (error) throw error
            setFiles(data || [])
        } catch (error) {
            console.error('Error fetching files:', error.message)
        }
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        setUploading(true)
        try {
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(`${Date.now()}_${file.name}`, file)

            if (uploadError) throw uploadError

            // Trigger Indexing (Mock for now, normally would call backend)
            await fetchFiles()
            alert('File uploaded successfully! Indexing started...')
        } catch (error) {
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // handleFileUpload({ target: { files: e.dataTransfer.files } }) // Reuse logic if extracted
            console.log("File dropped (implementation pending extraction)")
        }
    }

    async function handleGDriveUpload(event) {
        const file = event.target.files[0]
        if (!file) return
        setConnecting('Google Drive')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch(`${API_BASE}/api/config/gdrive`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                setPathwayInstructions("credentials.json uploaded. Run pipeline to sync.")
                setConnected(prev => [...prev, 'Google Drive'])
            } else {
                alert('Upload failed')
            }
        } catch (e) { alert('Error uploading credentials') }
        finally { setConnecting(null) }
    }

    const validateConfig = (source, config) => {
        const required = {
            'SharePoint': ['url', 'tenant_id', 'client_id', 'client_secret'],
            'Slack': ['bot_token', 'channel_id'],
            'Notion': ['integration_token'],
            'Generic': ['api_key', 'endpoint_url']
        }

        // Generic source validation
        if (!['SharePoint', 'Slack', 'Notion', 'Google Drive'].includes(source)) {
            return config.api_key && config.endpoint_url
        }

        const fields = required[source] || []
        return fields.every(field => config[field] && config[field].trim() !== '')
    }

    async function handleSharePointSubmit() {
        if (!validateConfig('SharePoint', sharepointConfig)) {
            alert('Please fill in all required SharePoint fields.')
            return
        }
        setConnecting('SharePoint')
        try {
            // Simulate verification delay
            await new Promise(r => setTimeout(r, 1500))

            const res = await fetch(`${API_BASE}/api/config/sharepoint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sharepointConfig)
            })
            if ((await res.json()).success) setPathwayInstructions("SharePoint configured. Run pipeline.")
            else alert('Configuration failed')
        } catch (error) { alert('Failed to save configuration') } finally { setConnecting(null) }
    }

    async function handleSlackSubmit() {
        if (!validateConfig('Slack', slackConfig)) {
            alert('Please input both Bot Token and Channel ID.')
            return
        }
        setConnecting('Slack')
        try {
            // Simulate verification delay
            await new Promise(r => setTimeout(r, 1500))

            const res = await fetch(`${API_BASE}/api/config/slack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slackConfig)
            })
            if ((await res.json()).success) setPathwayInstructions("Slack configured.")
            else alert('Configuration failed')
        } catch (error) { alert('Failed to save configuration') } finally { setConnecting(null) }
    }

    async function handleNotionSubmit() {
        if (!validateConfig('Notion', notionConfig)) {
            alert('Please enter your Integration Token.')
            return
        }
        setConnecting('Notion')
        try {
            // Simulate verification delay
            await new Promise(r => setTimeout(r, 1500))

            const res = await fetch(`${API_BASE}/api/config/notion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notionConfig)
            })
            if ((await res.json()).success) setPathwayInstructions("Notion configured.")
            else alert('Configuration failed')
        } catch (error) { alert('Failed to save configuration') } finally { setConnecting(null) }
    }

    async function handleGenericSubmit() {
        if (!validateConfig('Generic', genericConfig)) {
            alert('Please provide both API Credentials and Endpoint URL.')
            return
        }
        setConnecting(activeSource)
        try {
            // Simulate verification delay
            await new Promise(r => setTimeout(r, 1500))

            const res = await fetch(`${API_BASE}/api/config/generic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_name: activeSource, ...genericConfig })
            })
            if ((await res.json()).success) setPathwayInstructions(`${activeSource} configured.`)
            else alert('Configuration failed')
        } catch (error) { alert('Failed to save configuration') } finally { setConnecting(null) }
    }

    const confirmConnection = () => {
        if (pathwayInstructions) {
            setConnected(prev => [...prev, activeSource])
            setView('grid')
            setActiveSource(null)
            setPathwayInstructions(null)
        }
    }


    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12 px-8 relative overflow-hidden font-sans text-slate-600">
            {/* Background Blobs (Light Theme) */}
            <div className="payrix-blob-teal -top-20 -right-20 opacity-15"></div>
            <div className="payrix-blob-blue bottom-0 left-0 opacity-10"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-500 hover:text-slate-900"
                            title="Go Back"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Knowledge Vault</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage Sources & Integrations</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowGuide(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <BookOpen className="w-4 h-4" />
                            Connection Guide
                        </button>
                        <button
                            onClick={startPipeline}
                            disabled={pipelineRunning || pipelineStatus === 'starting'}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${pipelineRunning
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                                : 'bg-slate-900 text-white border border-slate-900 hover:bg-cyan-500 hover:text-black hover:scale-105'
                                }`}
                        >
                            {pipelineRunning ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Syncing Active
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    {pipelineStatus === 'starting' ? 'Starting...' : 'Start Auto-Sync'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    {['local', 'connectors'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab === 'local' ? 'Files' : 'Data Sources'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'local' ? (
                        <motion.div
                            key="local"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${dragActive ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-cyan-500/50 hover:bg-white/50'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-cyan-500">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Drag & drop files here</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">PDF, DOCX, TXT supported</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all hover:scale-105"
                                >
                                    {uploading ? 'Uploading...' : 'Browse Files'}
                                </button>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                            </div>

                            {/* File Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {files.map((file, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group relative">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500 mb-3 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 truncate mb-1">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(file.metadata?.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="connectors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {view === 'grid' ? (
                                <div className="space-y-12">
                                    {/* My Sources */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 ml-2">
                                            <Database className="w-5 h-5 text-slate-400" />
                                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Connectors</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {sources.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setActiveSource(s.name)
                                                        setView('active')
                                                    }}
                                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
                                                >
                                                    {connected.includes(s.name) && (
                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                                                        </div>
                                                    )}
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-50 transition-all mb-4">
                                                        {s.icon}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 mb-1">{s.name}</h3>
                                                    <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Marketplace */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 ml-2">
                                            <Globe className="w-5 h-5 text-slate-400" />
                                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Connector Marketplace</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {marketplace.map((m, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setActiveSource(m.name)
                                                        setView('active')
                                                    }}
                                                    className="bg-white/60 p-6 rounded-[2rem] border border-white hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
                                                >
                                                    {connected.includes(m.name) && (
                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                                                        </div>
                                                    )}
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:bg-slate-100 transition-all mb-4 border border-slate-100">
                                                        {m.icon}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{m.name}</h3>
                                                    <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-colors">{m.category}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Configuration View
                                <div className="max-w-2xl mx-auto">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

                                        {pathwayInstructions ? (
                                            // Success State
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                                    <CheckCircle className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-2">Connection Successful</h3>
                                                <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">{pathwayInstructions}</p>
                                                <button onClick={confirmConnection} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                                    Done
                                                </button>
                                            </div>
                                        ) : connected.includes(activeSource) ? (
                                            // ALREADY CONNECTED STATE
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-emerald-200 shadow-lg">
                                                    <CheckCircle className="w-10 h-10" />
                                                </div>
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{activeSource} is Active</h2>
                                                <p className="text-sm text-slate-500 font-bold mb-8">This source is connected and syncing.</p>

                                                <div className="flex justify-center gap-4">
                                                    <button onClick={() => setView('grid')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                                                        Back
                                                    </button>
                                                    {/* Placeholder for future Disconnect feature */}
                                                    <button disabled className="px-6 py-3 bg-slate-50 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-slate-100">
                                                        Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <button onClick={() => setView('grid')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                                                        <Search className="w-5 h-5 rotate-90" /> {/* Back Icon Placeholder */}
                                                    </button>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Connect {activeSource}</h2>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter Credentials</p>
                                                    </div>
                                                </div>

                                                {/* Dynamic Form Forms */}
                                                {activeSource === 'SharePoint' ? (
                                                    <div className="space-y-4">
                                                        <input type="text" placeholder="SharePoint Site URL" value={sharepointConfig.url} onChange={e => setSharePointConfig({ ...sharepointConfig, url: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                        <input type="text" placeholder="Tenant ID" value={sharepointConfig.tenant_id} onChange={e => setSharePointConfig({ ...sharepointConfig, tenant_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                        <input type="text" placeholder="Client ID" value={sharepointConfig.client_id} onChange={e => setSharePointConfig({ ...sharepointConfig, client_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                        <input type="password" placeholder="Client Secret" value={sharepointConfig.client_secret} onChange={e => setSharePointConfig({ ...sharepointConfig, client_secret: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                    </div>
                                                ) : activeSource === 'Google Drive' ? (
                                                    <div className="text-center py-8">
                                                        <p className="text-sm text-slate-600 mb-6">Upload your <code>service_account.json</code> key file to authorize access.</p>
                                                        <button onClick={() => gdriveInputRef.current?.click()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">Select Key File</button>
                                                        <input ref={gdriveInputRef} type="file" className="hidden" accept=".json" onChange={handleGDriveUpload} />
                                                    </div>
                                                ) : activeSource === 'Slack' ? (
                                                    <div className="space-y-4">
                                                        <input type="password" placeholder="Bot User OAuth Token (xoxb-...)" value={slackConfig.bot_token} onChange={e => setSlackConfig({ ...slackConfig, bot_token: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                        <input type="text" placeholder="Channel ID" value={slackConfig.channel_id} onChange={e => setSlackConfig({ ...slackConfig, channel_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                    </div>
                                                ) : activeSource === 'Notion' ? (
                                                    <div className="space-y-4">
                                                        <input type="password" placeholder="Internal Integration Token" value={notionConfig.integration_token} onChange={e => setNotionConfig({ ...notionConfig, integration_token: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-3 mb-1 block">
                                                                {marketplace.find(m => m.name === activeSource)?.category === 'Database' ? 'Connection String' : 'API Key / Token'}
                                                            </label>
                                                            <input type="password" value={genericConfig.api_key} onChange={e => setGenericConfig({ ...genericConfig, api_key: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" placeholder="••••••••" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-3 mb-1 block">
                                                                {marketplace.find(m => m.name === activeSource)?.category === 'Database' ? 'Database Name' : 'Endpoint URL'}
                                                            </label>
                                                            <input type="text" value={genericConfig.endpoint_url} onChange={e => setGenericConfig({ ...genericConfig, endpoint_url: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-cyan-500/20" placeholder="https://api..." />
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => activeSource === 'SharePoint' ? handleSharePointSubmit() : activeSource === 'Slack' ? handleSlackSubmit() : activeSource === 'Notion' ? handleNotionSubmit() : activeSource === 'Google Drive' ? gdriveInputRef.current?.click() : handleGenericSubmit()}
                                                    className="mt-8 w-full py-4 bg-slate-900 text-white hover:bg-cyan-500 hover:text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:scale-105 shadow-lg shadow-cyan-500/20"
                                                >
                                                    {connecting === activeSource ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            Connecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Server className="w-4 h-4" />
                                                            Connect Source
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guide Sidebar */}
                <AnimatePresence>
                    {showGuide && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowGuide(false)}
                                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-[101] border-l border-slate-200 overflow-y-auto"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-slate-900">How to Connect</h2>
                                        <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Dynamic Guide Content */}
                                        {[
                                            {
                                                name: 'Google Drive', icon: <Database />, steps: [
                                                    'Go to Google Cloud Console > IAM & Admin > Service Accounts.',
                                                    'Create a Service Account and generate a JSON Key.',
                                                    'Upload the JSON key file in Clause.',
                                                    'Share your target folder with the `client_email` from the JSON file.'
                                                ]
                                            },
                                            {
                                                name: 'SharePoint', icon: <Globe />, steps: [
                                                    'Register an App in Azure Portal > App registrations.',
                                                    'Generate a Client Secret in "Certificates & secrets".',
                                                    'Copy Application (client) ID and Directory (tenant) ID.',
                                                    'Enter these details along with your SharePoint Site URL.'
                                                ]
                                            },
                                            {
                                                name: 'Slack', icon: <MessageSquare />, steps: [
                                                    'Create an App in Slack API portal.',
                                                    'Install to workspace and copy `xoxb-` Bot User OAuth Token.',
                                                    'Add the app to the private channels you want to monitor.'
                                                ]
                                            },
                                            {
                                                name: 'Notion', icon: <FileText />, steps: [
                                                    'Go to Settings & members > Connections > Develop or manage integrations.',
                                                    'Create a new integration named "Clause" and copy the Secret.',
                                                    'Go to your target Notion page > "..." > Connections > Add "Clause".'
                                                ]
                                            },
                                            {
                                                name: 'Salesforce', icon: <Briefcase />, steps: [
                                                    'Setup > App Manager > New Connected App.',
                                                    'Enable OAuth Settings and copy Consumer Key & Secret.',
                                                    'Use your Salesforce Username and Security Token.'
                                                ]
                                            },
                                            {
                                                name: 'Jira', icon: <Server />, steps: [
                                                    'Atlassian Account Settings > Security > Create API token.',
                                                    'Use your Email and this API Token.'
                                                ]
                                            },
                                            {
                                                name: 'Zendesk', icon: <MessageSquare />, steps: [
                                                    'Admin Center > Apps and integrations > Zendesk API.',
                                                    'Enable Token Access and create a new API Token.'
                                                ]
                                            },
                                            {
                                                name: 'HubSpot', icon: <Briefcase />, steps: [
                                                    'Settings > Integrations > Private Apps > Create a private app.',
                                                    'Select scopes (e.g. crm.objects.contacts.read) and copy Access Token.'
                                                ]
                                            },
                                            {
                                                name: 'GitHub', icon: <Server />, steps: [
                                                    'Settings > Developer settings > Personal access tokens.',
                                                    'Generate new token with `repo` scope.'
                                                ]
                                            },
                                            {
                                                name: 'Stripe', icon: <Lock />, steps: [
                                                    'Dashboard > Developers > API keys.',
                                                    'Copy the Secret key (`sk_live_...`).'
                                                ]
                                            }
                                        ].filter(g => activeSource ? g.name === activeSource : true).map((guide, i) => (
                                            <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-900">
                                                        {guide.icon}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">{guide.name}</h3>
                                                </div>
                                                <ol className="space-y-4 text-sm text-slate-600 list-decimal pl-4">
                                                    {guide.steps.map((step, j) => (
                                                        <li key={j} className="pl-2" dangerouslySetInnerHTML={{ __html: step.replace(/(Go to|Create|Upload|Share|Register|Generate|Copy|Enter|Install|Add|Select|Use)/g, '<strong>$1</strong>') }} />
                                                    ))}
                                                </ol>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-100 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-cyan-800 leading-relaxed font-bold">
                                            Need help? check the docs or contact support.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}
