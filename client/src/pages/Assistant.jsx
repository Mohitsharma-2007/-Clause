import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User, ArrowRight, History, MessageSquare, Trash2, Clock, Bot, Brain, ChevronDown, ChevronRight, Zap, X, FileText, Search, Activity, FileOutput } from 'lucide-react'
import { ChatInput } from '../components/ChatInput'
import { supabase } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'

const PdfViewer = ({ url }) => {
    const [loading, setLoading] = useState(true)
    return (
        <div className="w-full h-full relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin" />
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Loading Document</span>
                    </div>
                </div>
            )}
            <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full border-0"
                title="PDF Preview"
                onLoad={() => setLoading(false)}
            />
        </div>
    )
}

export function Assistant() {
    const [currentSessionId, setCurrentSessionId] = useState(null)
    const [messages, setMessages] = useState([])
    const [sessions, setSessions] = useState({}) // { sessionId: [messages] }
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [thinkingStep, setThinkingStep] = useState(null)
    const [viewingPdf, setViewingPdf] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, thinkingStep])

    useEffect(() => {
        fetchHistory()
    }, [])

    // Generate a UUID for new sessions
    const generateUUID = () => {
        return crypto.randomUUID()
    }

    async function fetchHistory() {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            if (data) {
                const grouped = {}
                let uncategorized = []

                data.forEach(m => {
                    try {
                        const content = JSON.parse(m.content)
                        const msg = { ...m, content }
                        const sid = m.session_id || 'legacy'
                        if (!grouped[sid]) grouped[sid] = []
                        grouped[sid].push(msg)
                    } catch {
                        // ignore malformed
                    }
                })

                setSessions(grouped)

                // If we have sessions, load the most recent one found (or legacy)
                // Prefer the one with the latest created_at
                const sortedSessionIds = Object.keys(grouped).sort((a, b) => {
                    const lastA = grouped[a][grouped[a].length - 1].created_at
                    const lastB = grouped[b][grouped[b].length - 1].created_at
                    return new Date(lastB) - new Date(lastA)
                })

                if (sortedSessionIds.length > 0) {
                    const latest = sortedSessionIds[0]
                    setCurrentSessionId(latest)
                    setMessages(grouped[latest])
                } else {
                    // Start fresh
                    const newId = generateUUID()
                    setCurrentSessionId(newId)
                    setMessages([])
                }
            }
        } catch (err) {
            console.error('Error fetching history:', err)
        }
    }

    const startNewChat = () => {
        const newId = generateUUID()
        setCurrentSessionId(newId)
        setMessages([])
        setSessions(prev => ({ ...prev, [newId]: [] }))
    }

    async function saveMessage(role, content) {
        try {
            const payload = {
                role,
                content: typeof content === 'string' ? content : JSON.stringify(content),
                session_id: currentSessionId
            }

            // Optimistic update
            const newMsg = { id: Date.now(), role, content, created_at: new Date().toISOString() }

            // Supabase Insert
            const { error } = await supabase
                .from('chat_history')
                .insert([payload])

            if (error) {
                // Check if session_id column error, retry without it if needed
                if (error.message.includes('column "session_id" does not exist')) {
                    console.warn("session_id column missing. Saving without session_id.")
                    delete payload.session_id
                    await supabase.from('chat_history').insert([payload])
                } else {
                    throw error
                }
            }

            // Update local session state to keep sidebar in sync
            setSessions(prev => {
                const updated = { ...prev }
                if (!updated[currentSessionId]) updated[currentSessionId] = []
                updated[currentSessionId].push(newMsg)
                return updated
            })

        } catch (err) {
            console.error('Error saving message:', err)
        }
    }

    const [sessionNames, setSessionNames] = useState({})
    const [editingSessionId, setEditingSessionId] = useState(null)
    const [editNameInput, setEditNameInput] = useState('')

    // Load session names from local storage on mount
    useEffect(() => {
        const savedNames = localStorage.getItem('clause_session_names')
        if (savedNames) {
            setSessionNames(JSON.parse(savedNames))
        }
    }, [])

    // Delete Session - Fixed Logic
    async function deleteSession(sessionId) {
        if (!confirm('Delete this entire chat session?')) return
        try {
            let query = supabase.from('chat_history').delete()

            if (sessionId === 'legacy') {
                query = query.is('session_id', null)
            } else {
                query = query.eq('session_id', sessionId)
            }

            const { error: delError } = await query

            if (delError) {
                alert('Failed to delete session: ' + delError.message)
                throw delError
            }

            // Update State
            setSessions(prev => {
                const updated = { ...prev }
                delete updated[sessionId]
                return updated
            })

            // If deleted current, switch to another or new
            if (currentSessionId === sessionId) {
                const remaining = Object.keys(sessions).filter(id => id !== sessionId)
                if (remaining.length > 0) {
                    loadSession(remaining[0])
                } else {
                    startNewChat()
                }
            }
        } catch (err) {
            console.error('Error deleting session:', err)
        }
    }

    const startEditingName = (sid, currentName) => {
        setEditingSessionId(sid)
        setEditNameInput(currentName)
    }

    const saveSessionName = (sid) => {
        const newNames = { ...sessionNames, [sid]: editNameInput }
        setSessionNames(newNames)
        localStorage.setItem('clause_session_names', JSON.stringify(newNames))
        setEditingSessionId(null)
    }

    const getSessionName = (sid, msgs) => {
        if (sessionNames[sid]) return sessionNames[sid]
        const firstUserMsg = msgs.find(m => m.role === 'user')?.content
        if (typeof firstUserMsg === 'string') return firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')
        if (firstUserMsg?.answer) return firstUserMsg.answer.slice(0, 30) + '...'
        return "New Conversation"
    }

    // ... (rest of render)

    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {Object.entries(sessions)
            .sort(([, a], [, b]) => {
                const timeA = a[a.length - 1]?.created_at || 0
                const timeB = b[b.length - 1]?.created_at || 0
                return new Date(timeB) - new Date(timeA)
            })
            .map(([sid, msgs], i) => (
                <div
                    key={sid}
                    onClick={() => loadSession(sid)}
                    className={`p-4 rounded-2xl border transition-all group cursor-pointer relative ${sid === currentSessionId ? 'bg-white/10 border-[#4ade80]/50' : 'bg-white/5 border-white/5 hover:border-[#4ade80]/30'}`}
                >
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {msgs[msgs.length - 1]?.created_at ? new Date(msgs[msgs.length - 1].created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'New Session'}
                    </p>

                    {editingSessionId === sid ? (
                        <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                value={editNameInput}
                                onChange={e => setEditNameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveSessionName(sid)}
                                onBlur={() => saveSessionName(sid)}
                                className="w-full bg-black/50 text-white text-xs p-1 rounded border border-[#4ade80]/50 outline-none"
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-white/60 font-medium line-clamp-2 leading-relaxed pr-6">
                            {getSessionName(sid, msgs)}
                        </p>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); startEditingName(sid, getSessionName(sid, msgs)) }}
                            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
                            title="Rename"
                        >
                            <FileText className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteSession(sid) }}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
    </div>

    const loadSession = (sid) => {
        setCurrentSessionId(sid)
        setMessages(sessions[sid] || [])
        setShowHistory(false) // Close sidebar on select
    }

    async function clearHistory() {
        // Renamed/deprecated functionality - mapped to deleting all sessions?
        // Let's keep clearHistory as "Nuke All"
        if (!confirm('NUKING ALL HISTORY? This cannot be undone.')) return
        try {
            const { error } = await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (error) throw error
            setMessages([])
            setSessions({})
            startNewChat()
        } catch (err) { console.error(err) }
    }


    const getPdfUrl = (filename) => {
        const { data } = supabase.storage.from('policies').getPublicUrl(filename)
        return data.publicUrl
    }

    async function triggerAgentAction(action) {
        if (loading) return
        setLoading(true)
        setThinkingStep(`Executing Agent Action: ${action}...`)

        try {
            const userContext = JSON.parse(localStorage.getItem('clause_onboarding') || '{}')
            const res = await fetch('http://localhost:8001/api/agent/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, context: userContext })
            })
            const data = await res.json()

            if (data.success) {
                const content = {
                    answer: `**Action Completed: ${action}**\n\n${data.result}`,
                    reasoning: `Executed via Agent API. Summary: ${data.summary}`,
                    actions: ["Refine Draft", "Save to Drive", "Email Team"]
                }
                const msg = { id: Date.now(), role: 'assistant', content }
                setMessages(prev => [...prev, msg])
                await saveMessage('assistant', content)
            } else {
                throw new Error(data.result)
            }
        } catch (e) {
            const err = `Action Failed: ${e.message}`
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: err }])
        } finally {
            setLoading(false)
            setThinkingStep(null)
        }
    }

    async function sendMessage(text = input) {
        const queryText = text || input
        if (!queryText.trim() || loading) return

        const userMessage = { id: Date.now().toString(), role: 'user', content: queryText }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        const steps = ['Analyzing Query...', 'Retrieving Policy Context...', 'Synthesizing Response...']
        let stepIdx = 0
        const stepInterval = setInterval(() => {
            setThinkingStep(steps[stepIdx])
            stepIdx = (stepIdx + 1) % steps.length
        }, 800)

        await saveMessage('user', queryText)

        try {
            let userContext = null
            try {
                userContext = JSON.parse(localStorage.getItem('clause_onboarding'))
            } catch (e) {
                console.error("Failed to load user context", e)
            }

            const response = await fetch('http://localhost:8001/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: queryText, user_context: userContext }),
            })

            if (!response.ok) throw new Error('Failed to get response')

            const data = await response.json()
            const result = data[0]

            const botContent = {
                answer: result.answer || "I couldn't find an answer.",
                reasoning: result.reasoning || "Direct response generated.",
                actions: result.actions || [],
                citations: result.citations || []
            }

            const botMessage = { id: Date.now() + 1, role: 'assistant', content: botContent }
            setMessages(prev => [...prev, botMessage])
            await saveMessage('assistant', botContent)
        } catch (error) {
            console.error(error)
            const errorMsg = "Sorry, I encountered an error. Please ensure the backend is running."
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: errorMsg }])
            await saveMessage('assistant', errorMsg)
        } finally {
            clearInterval(stepInterval)
            setThinkingStep(null)
            setLoading(false)
        }
    }

    const AgentTools = () => (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none justify-center">
            {[
                { label: "Summarize Policy", icon: FileText, action: "Summarize the latest policy" },
                { label: "Scan Violations", icon: Activity, action: "Scan for new violations" },
                { label: "Draft Report", icon: FileOutput, action: "Draft a compliance report" },
                { label: "Search Rules", icon: Search, action: "List all critical rules" }
            ].map((tool, i) => (
                <button
                    key={i}
                    onClick={() => triggerAgentAction(tool.action)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4ade80]/50 rounded-full text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    <tool.icon className="w-3 h-3 text-[#4ade80]" />
                    {tool.label}
                </button>
            ))}
        </div>
    )

    const MessageContent = ({ content, role }) => {
        const [showReasoning, setShowReasoning] = useState(false)
        const isLegacy = typeof content === 'string'
        const answer = isLegacy ? content : content.answer
        const reasoning = isLegacy ? null : content.reasoning
        const actions = isLegacy ? [] : content.actions || []
        const citations = isLegacy ? [] : content.citations || []

        if (role === 'user') {
            return <p className="whitespace-pre-wrap font-medium">{content}</p>
        }

        return (
            <div className="space-y-4">
                {reasoning && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        <button
                            onClick={() => setShowReasoning(!showReasoning)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#4ade80]/60 hover:text-[#4ade80] hover:bg-white/5 transition-all"
                        >
                            <Brain className="w-3 h-3" />
                            <span>Analysis Log</span>
                            {showReasoning ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
                        </button>
                        <AnimatePresence>
                            {showReasoning && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 py-3 text-xs text-slate-300 font-mono border-t border-white/10 leading-relaxed bg-black/40"
                                >
                                    {reasoning}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-a:text-[#4ade80] prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-[#4ade80] prose-blockquote:bg-[#4ade80]/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                </div>

                {(citations.length > 0 || actions.length > 0) && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                        {citations.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 self-center mr-2">Sources:</span>
                                {citations.map((cite, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setViewingPdf(cite)}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/20 rounded text-[10px] text-[#4ade80] font-mono transition-colors"
                                    >
                                        <FileText className="w-3 h-3" />
                                        {cite}
                                    </button>
                                ))}
                            </div>
                        )}

                        {actions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {actions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => triggerAgentAction(action)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 hover:scale-105"
                                    >
                                        <Zap className="w-3 h-3 text-yellow-400" />
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen relative overflow-hidden bg-[#050505]"
        >
            {/* ... (Backgrounds remain same) */}

            {/* Premium PDF Preview Sidebar */}
            <AnimatePresence>
                {viewingPdf && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-[600px] z-[100] bg-black/40 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#4ade80]/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-[#4ade80]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white truncate max-w-[300px] italic tracking-tight uppercase">
                                        {viewingPdf}
                                    </span>
                                    <span className="text-[10px] text-[#4ade80] font-bold uppercase tracking-widest">
                                        Document Preview
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={getPdfUrl(viewingPdf)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-[#4ade80] transition-all flex items-center gap-2"
                                    title="Open in New Tab"
                                >
                                    <FileOutput className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setViewingPdf(null)}
                                    className="p-2 hover:bg-red-500/20 rounded-xl text-white/60 hover:text-red-500 transition-all ml-2"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Container with Loading State */}
                        <div className="flex-1 relative bg-black/20">
                            <PdfViewer url={getPdfUrl(viewingPdf)} />
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <button
                                onClick={() => triggerAgentAction(`Extract key compliance rules from ${viewingPdf}`)}
                                className="w-full py-3 bg-[#4ade80] hover:bg-[#22c55e] text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                            >
                                <Zap className="w-4 h-4" />
                                Analyze Document
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Toggle Button */}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="fixed left-12 top-32 z-[60] bg-white/10 backdrop-blur-2xl p-4 rounded-full border border-white/20 hover:bg-white/20 transition-all group shadow-2xl"
            >
                <History className={`w-5 h-5 ${showHistory ? 'text-[#4ade80]' : 'text-white'}`} />
            </button>

            {/* Floating History Sidebar */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ x: -400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -400, opacity: 0 }}
                        className="fixed left-12 top-52 bottom-12 w-80 bg-black/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 z-50 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white italic tracking-tight">SESSIONS</h3>
                            <div className="flex gap-2">
                                <button onClick={() => { startNewChat(); setShowHistory(false) }} className="text-[#4ade80] hover:scale-110 transition-all p-2 bg-[#4ade80]/10 rounded-xl" title="New Chat">
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button onClick={clearHistory} className="text-red-500 hover:scale-110 transition-all p-2 bg-red-500/10 rounded-xl" title="Delete All">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {Object.entries(sessions)
                                .sort(([, a], [, b]) => {
                                    const timeA = a[a.length - 1]?.created_at || 0
                                    const timeB = b[b.length - 1]?.created_at || 0
                                    return new Date(timeB) - new Date(timeA)
                                })
                                .map(([sid, msgs], i) => (
                                    <div
                                        key={sid}
                                        onClick={() => loadSession(sid)}
                                        className={`p-4 rounded-2xl border transition-all group cursor-pointer relative ${sid === currentSessionId ? 'bg-white/10 border-[#4ade80]/50' : 'bg-white/5 border-white/5 hover:border-[#4ade80]/30'}`}
                                    >
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {msgs[msgs.length - 1]?.created_at ? new Date(msgs[msgs.length - 1].created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'New Session'}
                                        </p>
                                        <p className="text-xs text-white/60 font-medium line-clamp-2 leading-relaxed">
                                            {msgs.find(m => m.role === 'user')?.content.answer || msgs.find(m => m.role === 'user')?.content || "New Conversation"}
                                        </p>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSession(sid) }}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col items-center relative z-10 px-4 w-full max-w-5xl mx-auto pt-32 pb-48">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mt-20"
                    >
                        <div className="relative inline-block">
                            <h1 className="text-[120px] font-black leading-none tracking-tighter text-[#101014] relative z-10 drop-shadow-2xl italic">Clause</h1>
                            <h1 className="absolute top-0 left-0 w-full text-[120px] font-black leading-none tracking-tighter text-black/40 blur-3xl select-none z-0 italic">Clause</h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] mt-4">Agentic Compliance Intelligence</p>
                    </motion.div>
                ) : (
                    <div className="w-full space-y-8">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-6 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#4ade80] shrink-0 border border-[#4ade80]/30 shadow-lg mt-1">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}

                                <div className={`
                                    max-w-[85%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-xl backdrop-blur-3xl
                                    ${msg.role === 'assistant'
                                        ? 'bg-black/80 border border-white/10 text-gray-100 rounded-tl-none shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                                        : 'bg-[#4ade80] text-[#022c22] font-black rounded-tr-none shadow-[0_10px_30px_rgba(74,222,128,0.2)]'}
                                `}>
                                    <MessageContent content={msg.content} role={msg.role} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Thinking/Loading Indicator */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center gap-3 mt-8 ml-16 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 w-fit"
                        >
                            <Loader2 className="w-4 h-4 text-[#4ade80] animate-spin" />
                            <span className="text-xs font-mono text-[#4ade80] uppercase tracking-widest animate-pulse">
                                {thinkingStep || 'Processing...'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 w-full p-6 z-50 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-32 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    {!loading && messages.length > 0 && <AgentTools />}
                    <ChatInput
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onSend={() => sendMessage()}
                        loading={loading}
                        placeholder={loading ? "Agent is working..." : "Ask Clause about compliance risks..."}
                    />
                </div>
            </div>
        </motion.div>
    )
}

function Loader2({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
