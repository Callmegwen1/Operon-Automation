'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, X, Send, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content: "Hey! I'm Ope 👋 I'm here to help small business owners like you find where you're losing customers — and fix it. What can I help you with?",
}

const QUICK_REPLIES = [
  'How does Operon work?',
  "What's the Revenue Leak Scanner?",
  'Tell me about pricing',
  'Is Operon right for my business?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#0f2744] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#0f2744] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#0f2744] text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        {message.content}
        {message.streaming && (
          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  )
}

export default function OpeWidget() {
  const [open, setOpen]         = useState(false)
  const [pinged, setPinged]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)
  const abortRef                = useRef<AbortController | null>(null)

  // Ping animation stops after widget is opened once
  useEffect(() => {
    if (open) { setPinged(true); return }
    if (pinged) return
    const t = setTimeout(() => setPinged(false), 0) // keep pinging until first open
    return () => clearTimeout(t)
  }, [open, pinged])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setLoading(true)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])

    const history = [...messages, userMsg]
      .filter(m => m.id !== 'greeting') // exclude hardcoded greeting from API history
      .map(m => ({ role: m.role, content: m.content }))

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
        signal:  controller.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error('Bad response')
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ))
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ))
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "I'm having trouble connecting right now. Try refreshing, or email us at hello@operonauto.com!", streaming: false }
            : m
        ))
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    setOpen(false)
  }

  const showQuickReplies = messages.length === 1

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <div
        className={`
          flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300 origin-bottom-right
          w-[calc(100vw-2.5rem)] sm:w-[380px]
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }
        `}
        style={{ height: '580px', maxHeight: 'calc(100vh - 5rem)' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="bg-[#0f2744] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f2744]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">Ope</p>
            <p className="text-white/60 text-xs">Operon AI · Usually instant</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close chat"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <TypingIndicator />
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies — only when on greeting */}
        {showQuickReplies && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-[#0f2744] hover:text-[#0f2744] transition-colors disabled:opacity-50"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 px-3 py-3 flex items-end gap-2 flex-shrink-0"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 outline-none bg-slate-50 rounded-xl px-3 py-2.5 max-h-28 leading-relaxed"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex-shrink-0 rounded-xl bg-[#0f2744] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1a3a5c] transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-14 h-14 rounded-full bg-[#0f2744] text-white shadow-lg hover:bg-[#1a3a5c] transition-all duration-200 hover:scale-105 flex items-center justify-center"
        aria-label={open ? 'Close Ope chat' : 'Open Ope chat'}
      >
        {!pinged && !open && (
          <span className="absolute inset-0 rounded-full bg-[#0f2744] animate-ping opacity-40" />
        )}
        <div className={`transition-all duration-200 ${open ? 'rotate-0 scale-100' : 'rotate-0 scale-100'}`}>
          {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </div>
      </button>
    </div>
  )
}
