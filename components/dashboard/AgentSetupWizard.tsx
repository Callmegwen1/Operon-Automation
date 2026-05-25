'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X, ArrowRight, ArrowLeft, CheckCircle2, Copy, Check, Upload,
  Globe, FileSpreadsheet, Zap, Users, Star, Mail, BarChart2,
  Loader2, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AgentType = 'lead_followup' | 'review_request' | 'weekly_report'

interface AgentConfig {
  fromName?: string
  replyToEmail?: string
  phone?: string
  reviewLink?: string
  reportEmail?: string
  personalNote?: string
}

interface WizardProps {
  type: AgentType
  userId: string
  initialConfig: AgentConfig
  onComplete: (config: AgentConfig) => void
  onClose: () => void
}

// ─── shared helpers ────────────────────────────────────────────────────────

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="flex gap-2 mt-3">
      <input
        ref={ref}
        readOnly
        value={value}
        onClick={() => ref.current?.select()}
        className="flex-1 border border-op-border rounded-lg px-3 py-2.5 text-xs font-mono text-op-muted bg-op-bg focus:outline-none focus:border-op-navy cursor-text truncate"
      />
      <button onClick={copy} className="btn-secondary text-xs px-3 py-2 shrink-0 flex items-center gap-1.5">
        {copied ? <Check size={13} className="text-op-green" /> : <Copy size={13} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  if (done)   return <div className="w-2 h-2 rounded-full bg-op-green" />
  if (active) return <div className="w-2 h-2 rounded-full bg-op-navy" />
  return <div className="w-2 h-2 rounded-full bg-op-border" />
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

const inputClass =
  'w-full border border-op-border rounded-lg px-4 py-3 text-sm text-op-body placeholder-op-muted focus:outline-none focus:ring-2 focus:ring-op-navy/20 focus:border-op-navy transition-all bg-white'

// ─── Lead Follow-Up Wizard ─────────────────────────────────────────────────

type LeadSource = 'website' | 'spreadsheet' | 'no-system' | 'other'

const LEAD_SOURCES = [
  {
    id: 'website' as LeadSource,
    icon: Globe,
    title: 'My website has a contact form',
    desc: 'Connect your site so every form submission lands here automatically.',
  },
  {
    id: 'spreadsheet' as LeadSource,
    icon: FileSpreadsheet,
    title: 'I have a spreadsheet or old CRM',
    desc: 'Import your existing contacts and start the sequence on all of them at once.',
  },
  {
    id: 'no-system' as LeadSource,
    icon: Users,
    title: 'I don\'t have a system yet',
    desc: 'Use Operon\'s built-in contact manager — just add leads and automation handles the rest.',
  },
  {
    id: 'other' as LeadSource,
    icon: Zap,
    title: 'I use another tool (Zapier, Typeform, etc.)',
    desc: 'Connect any tool to Operon using your personal webhook URL.',
  },
]

const EMBED_PLATFORMS = [
  { id: 'wordpress',   label: 'WordPress',   instruction: 'Go to the page editor → click + to add a block → search "Custom HTML" → paste the embed code → Update.' },
  { id: 'wix',         label: 'Wix',         instruction: 'In Wix Editor → Add Element → Embed Code → Custom Embeds → HTML iFrame → paste the embed code → Apply.' },
  { id: 'squarespace', label: 'Squarespace', instruction: 'Edit a page → click + to add a block → choose Embed → paste the embed code → Apply.' },
  { id: 'webflow',     label: 'Webflow',     instruction: 'Add an Embed element to your page → paste the embed code → Save & Publish.' },
  { id: 'showit',      label: 'Showit',      instruction: 'Open the canvas → drag in a Code widget → paste the embed code → publish.' },
  { id: 'other',       label: 'Other',       instruction: 'Look for an HTML block, Embed, or Custom Code option in your page editor. Paste the embed code there and save.' },
]

function LeadFollowupWizard({ userId, initialConfig, onComplete }: {
  userId: string
  initialConfig: AgentConfig
  onComplete: (config: AgentConfig) => void
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://operonauto.com'
  const webhookUrl = `${origin}/api/public/leads/${userId}`
  const embedCode  = `<iframe src="${origin}/form/${userId}" width="100%" height="480" frameborder="0" style="border-radius:12px;border:none;"></iframe>`
  const [step, setStep] = useState(0)
  const [source, setSource] = useState<LeadSource | null>(null)
  const [platform, setPlatform] = useState(EMBED_PLATFORMS[0].id)
  const [importCount, setImportCount] = useState<number | null>(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [config, setConfig] = useState<AgentConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [activationDone, setActivationDone] = useState(false)
  const [verifyUrl, setVerifyUrl] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'found' | 'not-found' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalSteps = 4
  const platformInfo = EMBED_PLATFORMS.find((p) => p.id === platform) ?? EMBED_PLATFORMS[0]

  // Pre-fill from known business data so users don't retype their own info
  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('businesses').select('name, phone').eq('user_id', userId).single(),
    ]).then(([{ data: { user } }, { data: biz }]) => {
      setConfig((c) => ({
        ...c,
        fromName:     c.fromName     || biz?.name  || '',
        replyToEmail: c.replyToEmail || user?.email || '',
        phone:        c.phone        || biz?.phone  || '',
      }))
    })
  }, [userId])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError('')
    const text = await file.text()
    const rows = parseCSV(text)
    const res = await fetch('/api/contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, triggerFollowup: true }),
    })
    const data = await res.json()
    if (res.ok) setImportCount(data.imported)
    else setImportError(data.error ?? 'Import failed')
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleVerify = async () => {
    if (!verifyUrl.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch(`/api/verify-embed?userId=${userId}&pageUrl=${encodeURIComponent(verifyUrl.trim())}`)
      const data = await res.json()
      setVerifyResult(data.found ? 'found' : 'not-found')
    } catch {
      setVerifyResult('not-found')
    }
    setVerifying(false)
  }

  const handleFinish = async () => {
    setSaving(true)
    await fetch('/api/agents/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lead_followup', config }),
    })
    await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lead_followup', enabled: true }),
    })
    await fetch('/api/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'lead_followup' }),
    })
    setSaving(false)
    setActivationDone(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <StepDot key={i} active={i === step} done={i < step} />
        ))}
        <span className="text-xs text-op-muted ml-2">Step {step + 1} of {totalSteps}</span>
      </div>

      {/* Step 0 — source selection */}
      {step === 0 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">How do your leads reach you?</h2>
          <p className="text-sm text-op-muted mb-6">We'll connect the right way based on your setup.</p>
          <div className="flex flex-col gap-3">
            {LEAD_SOURCES.map(({ id, icon: Icon, title, desc }) => (
              <button
                key={id}
                onClick={() => setSource(id)}
                className={`flex items-center gap-4 border-2 rounded-xl p-4 text-left transition-all ${
                  source === id ? 'border-op-navy bg-op-navy/5' : 'border-op-border hover:border-op-navy/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${source === id ? 'bg-op-navy' : 'bg-op-bg'}`}>
                  <Icon size={18} className={source === id ? 'text-white' : 'text-op-muted'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-op-navy">{title}</p>
                  <p className="text-xs text-op-muted mt-0.5">{desc}</p>
                </div>
                {source === id && <CheckCircle2 size={18} className="text-op-navy ml-auto shrink-0" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!source}
            className="btn-primary w-full mt-6 justify-center disabled:opacity-50"
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 1 — source-specific setup */}
      {step === 1 && source === 'website' && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Add a contact form to your site</h2>
          <p className="text-sm text-op-muted mb-5">
            Copy the code below and paste it into your website. Your visitors fill it out on your site — leads arrive in Operon automatically.
          </p>

          <p className="text-xs font-bold text-op-navy mb-2">Your embed code</p>
          <CopyField value={embedCode} />
          <p className="text-xs text-op-muted mt-2 mb-5">One copy-paste. No plugins, no developer needed.</p>

          <p className="text-xs font-bold text-op-navy mb-2">Which website builder are you using?</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {EMBED_PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`border rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
                  platform === p.id ? 'border-op-navy bg-op-navy text-white' : 'border-op-border text-op-muted hover:border-op-navy'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="bg-op-bg border border-op-border rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-op-body leading-relaxed">{platformInfo.instruction}</p>
          </div>

          {/* Advanced: raw webhook for developers */}
          <details className="mb-5">
            <summary className="text-xs text-op-muted cursor-pointer hover:text-op-navy select-none">
              Developer option — use a raw webhook instead
            </summary>
            <div className="mt-2">
              <p className="text-xs text-op-muted mb-1">POST name, email, phone, and message to this URL from any form tool:</p>
              <CopyField value={webhookUrl} />
            </div>
          </details>

          {/* Verify the embed is live */}
          <div className="mb-5 border-t border-op-border pt-4">
            <p className="text-xs font-bold text-op-navy mb-1">Verify it's on your site</p>
            <p className="text-xs text-op-muted mb-2">Paste the page URL where you added the form — we'll confirm it's connected.</p>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-op-border rounded-lg px-3 py-2 text-xs text-op-body placeholder-op-muted focus:outline-none focus:border-op-navy bg-white transition-all"
                placeholder="https://yoursite.com/contact"
                value={verifyUrl}
                onChange={(e) => setVerifyUrl(e.target.value)}
              />
              <button
                onClick={handleVerify}
                disabled={verifying || !verifyUrl.trim()}
                className="btn-secondary text-xs px-3 py-2 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {verifying ? <Loader2 size={13} className="animate-spin" /> : 'Check'}
              </button>
            </div>
            {verifyResult === 'found' && (
              <p className="text-xs text-op-green font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Form detected — you're all connected!
              </p>
            )}
            {verifyResult === 'not-found' && (
              <p className="text-xs text-op-red mt-1.5">Couldn't find the form on that page. Make sure you saved the page after pasting the code.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">I've added it <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {step === 1 && source === 'spreadsheet' && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Import your existing contacts</h2>
          <p className="text-sm text-op-muted mb-5">Upload a CSV with your existing leads. We'll add them all and start the follow-up sequence on every one with an email address.</p>

          <div className="bg-op-bg border-2 border-dashed border-op-border rounded-xl p-6 text-center mb-4">
            {importing ? (
              <Loader2 size={24} className="animate-spin text-op-muted mx-auto mb-2" />
            ) : importCount !== null ? (
              <>
                <CheckCircle2 size={28} className="text-op-green mx-auto mb-2" />
                <p className="text-sm font-semibold text-op-green">{importCount} contacts imported</p>
                <p className="text-xs text-op-muted mt-1">The follow-up sequence has been scheduled for all leads with an email.</p>
              </>
            ) : (
              <>
                <Upload size={24} className="text-op-muted mx-auto mb-2" />
                <p className="text-sm font-semibold text-op-navy mb-1">Upload your CSV file</p>
                <p className="text-xs text-op-muted mb-3">Columns: name, email, phone (optional), source (optional)</p>
                <button onClick={() => fileRef.current?.click()} className="btn-primary text-sm mx-auto">
                  Choose File
                </button>
              </>
            )}
            {importError && <p className="text-xs text-op-red mt-2">{importError}</p>}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">
              {importCount !== null ? 'Continue' : 'Skip for now'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 1 && source === 'no-system' && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">You'll use Operon Contacts</h2>
          <p className="text-sm text-op-muted mb-5">No previous system needed. Here's how it works:</p>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { step: '1', text: 'Go to Contacts and add a new lead with their name and email.' },
              { step: '2', text: 'This agent fires automatically — the lead gets a follow-up email in 15 minutes.' },
              { step: '3', text: 'Two more emails follow at Day 2 and Day 5. Nothing else for you to do.' },
            ].map(({ step: s, text }) => (
              <div key={s} className="flex items-start gap-3 bg-op-bg rounded-lg px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-op-navy text-white text-xs font-bold flex items-center justify-center shrink-0">{s}</span>
                <p className="text-sm text-op-body">{text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">Got it <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {step === 1 && source === 'other' && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Connect with your tool</h2>
          <p className="text-sm text-op-muted mb-5">Any tool that supports webhooks can send leads directly to Operon.</p>
          <p className="text-xs font-bold text-op-navy mb-2">Your unique webhook URL</p>
          <CopyField value={webhookUrl} />
          <div className="mt-5 flex flex-col gap-3">
            {[
              'Copy your webhook URL above.',
              'In your tool (Zapier, Make, Typeform, etc.), find Webhooks or Integrations.',
              'Set the method to POST and paste the URL.',
              'Map name, email, and phone from your form fields.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 bg-op-bg rounded-lg px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-op-navy text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-op-body">{text}</p>
              </div>
            ))}
          </div>
          <a
            href="https://zapier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-op-navy hover:underline mt-4"
          >
            <ExternalLink size={12} /> Open Zapier
          </a>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">Done <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {/* Step 2 — your details */}
      {step === 2 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Your follow-up details</h2>
          <p className="text-sm text-op-muted mb-5">This is what leads will see when they receive your emails.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Your name <span className="text-op-red">*</span></label>
              <input className={inputClass} placeholder="John Smith" value={config.fromName ?? ''} onChange={(e) => setConfig((c) => ({ ...c, fromName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Your reply-to email <span className="text-op-red">*</span></label>
              <input type="email" className={inputClass} placeholder="you@yourbusiness.com" value={config.replyToEmail ?? ''} onChange={(e) => setConfig((c) => ({ ...c, replyToEmail: e.target.value }))} />
              <p className="text-xs text-op-muted mt-1">When leads reply to the email, it goes here.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Business phone <span className="text-op-muted font-normal">(optional)</span></label>
              <input className={inputClass} placeholder="(555) 000-0000" value={config.phone ?? ''} onChange={(e) => setConfig((c) => ({ ...c, phone: e.target.value }))} />
              <p className="text-xs text-op-muted mt-1">Included in the email so leads can call you directly.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Personal note <span className="text-op-muted font-normal">(optional)</span></label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="e.g. We specialize in last-minute jobs and same-day quotes — just call us!"
                value={config.personalNote ?? ''}
                onChange={(e) => setConfig((c) => ({ ...c, personalNote: e.target.value }))}
              />
              <p className="text-xs text-op-muted mt-1">Added at the bottom of the first email — a great place for a human touch.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!config.fromName?.trim() || !config.replyToEmail?.trim()}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              Preview email <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — email preview + activate */}
      {step === 3 && (
        <div className="flex-1 flex flex-col">
          {activationDone ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-op-green flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-2">Agent is Live!</h2>
              <p className="text-sm text-op-muted mb-5 max-w-sm">
                Every new lead with an email will automatically receive a 3-email follow-up sequence — no action needed from you.
              </p>
              <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-left">
                <div className="w-2 h-2 rounded-full bg-op-green mt-1 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  Test email sent to <strong>{config.replyToEmail}</strong> — check your inbox to confirm everything looks right.
                </p>
              </div>
              <button onClick={() => onComplete(config)} className="btn-primary w-full justify-center text-sm">
                Done
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Preview your first email</h2>
              <p className="text-sm text-op-muted mb-4">This is what your leads will receive 15 minutes after filling out your form.</p>

              {/* Email preview card */}
              <div className="border border-op-border rounded-xl overflow-hidden mb-5 text-left shadow-sm">
                {/* Email meta */}
                <div className="bg-op-bg border-b border-op-border px-4 py-2.5 flex flex-col gap-0.5">
                  <p className="text-xs text-op-muted"><span className="font-semibold text-op-navy">Subject:</span> Following up on your inquiry — {config.fromName || 'Your Business'}</p>
                  <p className="text-xs text-op-muted"><span className="font-semibold text-op-navy">From:</span> {config.fromName || 'Your Business'} &lt;{config.replyToEmail || 'you@yourbusiness.com'}&gt;</p>
                </div>
                {/* Email body preview */}
                <div className="bg-white">
                  <div className="bg-op-navy px-5 py-4">
                    <p className="text-white font-bold text-base">{config.fromName || 'Your Business'}</p>
                  </div>
                  <div className="px-5 py-5 flex flex-col gap-3 text-sm text-op-body">
                    <p>Hi <span className="font-semibold">Sarah</span>,</p>
                    <p className="leading-relaxed text-op-body/80">
                      Just wanted to make sure your message to <strong>{config.fromName || 'Your Business'}</strong> didn't get missed.
                    </p>
                    <p className="leading-relaxed text-op-body/80">
                      {config.fromName || 'The team'} will be in touch with you shortly. In the meantime, feel free to reach us directly:
                    </p>
                    {config.phone && (
                      <p className="font-bold text-op-navy">📞 {config.phone}</p>
                    )}
                    {config.personalNote && (
                      <p className="leading-relaxed text-op-body/80 pt-3 border-t border-op-border">{config.personalNote}</p>
                    )}
                    <p className="pt-1">Talk soon,<br /><strong>{config.fromName || 'Your Name'}</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-1.5 shrink-0"><ArrowLeft size={14} /> Edit</button>
                <button onClick={handleFinish} disabled={saving} className="btn-primary flex-1 justify-center text-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Activate Agent</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Review Request Wizard ─────────────────────────────────────────────────

type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'other'

const REVIEW_PLATFORMS = [
  {
    id: 'google' as ReviewPlatform,
    label: 'Google Business Profile',
    recommended: true,
    howTo: [
      'Go to your Google Business Profile (business.google.com)',
      'Click "Ask for reviews" or "Get more reviews"',
      'Copy the short review link provided',
    ],
  },
  {
    id: 'yelp' as ReviewPlatform,
    label: 'Yelp',
    recommended: false,
    howTo: [
      'Go to your Yelp Business page',
      'Copy the URL from your browser address bar',
      'Paste it below',
    ],
  },
  {
    id: 'facebook' as ReviewPlatform,
    label: 'Facebook',
    recommended: false,
    howTo: [
      'Go to your Facebook Business page',
      'Click "Reviews" in the left menu',
      'Copy the URL from your browser',
    ],
  },
  {
    id: 'other' as ReviewPlatform,
    label: 'Another platform',
    recommended: false,
    howTo: [
      'Go to wherever your customers can leave you a review',
      'Copy the direct review page URL',
      'Paste it below',
    ],
  },
]

function isValidReviewUrl(url: string): boolean {
  if (!url.trim()) return true
  try {
    const { hostname } = new URL(url)
    return ['g.page', 'google.com', 'yelp.com', 'facebook.com', 'tripadvisor.com', 'goo.gl']
      .some((d) => hostname === d || hostname.endsWith('.' + d))
  } catch { return false }
}

function ReviewRequestWizard({ userId, initialConfig, onComplete }: {
  userId: string
  initialConfig: AgentConfig
  onComplete: (config: AgentConfig) => void
}) {
  const [step, setStep] = useState(0)
  const [platform, setPlatform] = useState<ReviewPlatform | null>(null)
  const [config, setConfig] = useState<AgentConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [activationDone, setActivationDone] = useState(false)
  const totalSteps = 4
  const platformInfo = REVIEW_PLATFORMS.find((p) => p.id === platform)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('businesses').select('name').eq('user_id', userId).single(),
    ]).then(([{ data: { user } }, { data: biz }]) => {
      setConfig((c) => ({
        ...c,
        fromName:     c.fromName     || biz?.name  || '',
        replyToEmail: c.replyToEmail || user?.email || '',
      }))
    })
  }, [userId])

  const handleFinish = async () => {
    setSaving(true)
    await fetch('/api/agents/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'review_request', config }),
    })
    await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'review_request', enabled: true }),
    })
    await fetch('/api/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'review_request' }),
    })
    setSaving(false)
    setActivationDone(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <StepDot key={i} active={i === step} done={i < step} />
        ))}
        <span className="text-xs text-op-muted ml-2">Step {step + 1} of {totalSteps}</span>
      </div>

      {/* Step 0 — platform selection */}
      {step === 0 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Where do customers review you?</h2>
          <p className="text-sm text-op-muted mb-5">We'll send them directly to the right place.</p>
          <div className="flex flex-col gap-3">
            {REVIEW_PLATFORMS.map(({ id, label, recommended }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all ${
                  platform === id ? 'border-op-navy bg-op-navy/5' : 'border-op-border hover:border-op-navy/40'
                }`}
              >
                <Star size={18} className={platform === id ? 'text-op-navy' : 'text-op-muted'} />
                <span className="text-sm font-semibold text-op-navy flex-1">{label}</span>
                {recommended && (
                  <span className="text-[10px] font-bold bg-op-amber/10 text-op-amber border border-op-amber/20 px-2 py-0.5 rounded-full">Recommended</span>
                )}
                {platform === id && <CheckCircle2 size={16} className="text-op-navy shrink-0" />}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} disabled={!platform} className="btn-primary w-full mt-6 justify-center disabled:opacity-50">
            Continue <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 1 — get the link */}
      {step === 1 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Get your review link</h2>
          <p className="text-sm text-op-muted mb-5">Follow these steps to find your link, then paste it below.</p>
          <div className="flex flex-col gap-2 mb-4">
            {platformInfo?.howTo.map((instruction, i) => (
              <div key={i} className="flex items-start gap-3 bg-op-bg rounded-lg px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-op-navy text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-op-body">{instruction}</p>
              </div>
            ))}
          </div>

          {platform === 'google' && (
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-op-navy bg-op-navy/5 border border-op-navy/20 rounded-lg px-3 py-2 hover:bg-op-navy/10 transition-colors mb-4"
            >
              <ExternalLink size={12} /> Open Google Business Profile
            </a>
          )}

          <label className="block text-xs font-bold text-op-navy mb-1.5">Your review link <span className="text-op-red">*</span></label>
          <input
            className={inputClass}
            placeholder="https://g.page/r/..."
            value={config.reviewLink ?? ''}
            onChange={(e) => setConfig((c) => ({ ...c, reviewLink: e.target.value }))}
          />
          {config.reviewLink && !isValidReviewUrl(config.reviewLink) && (
            <p className="text-xs text-op-amber mt-1.5 font-medium">
              This doesn't look like a review page URL — double-check the link you copied.
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(2)} disabled={!config.reviewLink?.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50">
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — your details */}
      {step === 2 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Your details</h2>
          <p className="text-sm text-op-muted mb-5">How customers will see you in the review request email.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Your name <span className="text-op-red">*</span></label>
              <input className={inputClass} placeholder="John Smith" value={config.fromName ?? ''} onChange={(e) => setConfig((c) => ({ ...c, fromName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-op-navy mb-1.5">Your reply-to email <span className="text-op-red">*</span></label>
              <input type="email" className={inputClass} placeholder="you@yourbusiness.com" value={config.replyToEmail ?? ''} onChange={(e) => setConfig((c) => ({ ...c, replyToEmail: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
            <button onClick={() => setStep(3)} disabled={!config.fromName?.trim() || !config.replyToEmail?.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50">
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — confirm + activate */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center text-center">
          {activationDone ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-op-green flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-2">Agent is Live!</h2>
              <p className="text-sm text-op-muted mb-5 max-w-sm">
                Go to any customer in Contacts and click ⭐ Review — they'll get a personalized request in seconds.
              </p>
              <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-left">
                <div className="w-2 h-2 rounded-full bg-op-green mt-1 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  Test email sent to <strong>{config.replyToEmail}</strong> — check your inbox to see what your customers will receive.
                </p>
              </div>
              <button onClick={() => onComplete(config)} className="btn-primary w-full justify-center text-sm">
                Done
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-op-amber flex items-center justify-center mb-5">
                <Star size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-2">Ready to collect reviews!</h2>
              <p className="text-sm text-op-muted mb-6 max-w-sm">
                Go to any customer in Contacts and click the ⭐ Review button. We'll send you a test email the moment you activate so you can see exactly what your customers will receive.
              </p>
              <div className="w-full text-left bg-op-bg border border-op-border rounded-xl px-4 py-4 mb-6">
                <p className="text-xs font-bold text-op-navy mb-2">How to use it</p>
                <p className="text-xs text-op-muted leading-relaxed">
                  Contacts → find a customer → click ⭐ Review → done. The email goes out immediately with a direct link to your review page.
                </p>
              </div>
              <button onClick={handleFinish} disabled={saving} className="btn-primary w-full justify-center text-sm">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Activate Agent</>}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Weekly Report Wizard ──────────────────────────────────────────────────

function WeeklyReportWizard({ initialConfig, onComplete }: {
  initialConfig: AgentConfig
  onComplete: (config: AgentConfig) => void
}) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activationDone, setActivationDone] = useState(false)

  const handleFinish = async () => {
    setSaving(true)
    await fetch('/api/agents/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'weekly_report', config }),
    })
    await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'weekly_report', enabled: true }),
    })
    await fetch('/api/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'weekly_report' }),
    })
    setSaving(false)
    setActivationDone(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-8">
        <StepDot active={step === 0} done={step > 0} />
        <StepDot active={step === 1} done={step > 1} />
        <span className="text-xs text-op-muted ml-2">Step {step + 1} of 2</span>
      </div>

      {step === 0 && (
        <div className="flex-1">
          <h2 className="text-xl font-bold font-manrope text-op-navy mb-1">Set up your weekly report</h2>
          <p className="text-sm text-op-muted mb-6">Every Monday at 8:00 AM, you'll receive a summary of your business health — Revenue Leak Score, open leaks, agent activity, and what's been fixed.</p>
          <label className="block text-xs font-bold text-op-navy mb-1.5">Send report to <span className="text-op-red">*</span></label>
          <input
            type="email"
            className={inputClass}
            placeholder="you@yourbusiness.com"
            value={config.reportEmail ?? ''}
            onChange={(e) => setConfig((c) => ({ ...c, reportEmail: e.target.value }))}
          />
          <p className="text-xs text-op-muted mt-2">Use your personal email so you never miss it.</p>
          <button
            onClick={() => setStep(1)}
            disabled={!config.reportEmail?.trim()}
            className="btn-primary w-full mt-6 justify-center disabled:opacity-50"
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 flex flex-col items-center text-center">
          {activationDone ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-op-green flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-2">Report Scheduled!</h2>
              <p className="text-sm text-op-muted mb-5 max-w-sm">
                Every Monday at 8:00 AM, your business summary lands in <strong>{config.reportEmail}</strong>.
              </p>
              <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-left">
                <div className="w-2 h-2 rounded-full bg-op-green mt-1 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  Sample report sent to <strong>{config.reportEmail}</strong> — check your inbox to see what you'll receive each Monday.
                </p>
              </div>
              <button onClick={() => onComplete(config)} className="btn-primary w-full justify-center text-sm">
                Done
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-op-green flex items-center justify-center mb-5">
                <BarChart2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold font-manrope text-op-navy mb-2">Ready to activate</h2>
              <p className="text-sm text-op-muted mb-6 max-w-sm">
                Every Monday at 8:00 AM, a report lands in <strong>{config.reportEmail}</strong>. We'll send you a sample right now so you know exactly what to expect.
              </p>
              <div className="w-full text-left bg-op-bg border border-op-border rounded-xl px-4 py-4 mb-6 flex flex-col gap-2">
                {['Revenue Leak Score (and change from last week)', 'Open leaks still needing attention', "Leaks you've fixed", 'Agent activity — emails sent, reviews requested'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-op-body">
                    <CheckCircle2 size={13} className="text-op-green shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={handleFinish} disabled={saving} className="btn-primary w-full justify-center text-sm">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Activate Agent</>}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function AgentSetupWizard({ type, userId, initialConfig, onComplete, onClose }: WizardProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-op-border shrink-0">
          <div className="flex items-center gap-3">
            {type === 'lead_followup'  && <Mail size={18} className="text-op-navy" />}
            {type === 'review_request' && <Star size={18} className="text-op-amber" />}
            {type === 'weekly_report'  && <BarChart2 size={18} className="text-op-green" />}
            <p className="text-sm font-bold text-op-navy">
              {type === 'lead_followup'  && 'Set up Lead Follow-Up Agent'}
              {type === 'review_request' && 'Set up Review Request Agent'}
              {type === 'weekly_report'  && 'Set up Weekly Owner Report'}
            </p>
          </div>
          <button onClick={onClose} className="text-op-muted hover:text-op-navy transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Wizard content */}
        <div className="p-6 flex-1">
          {type === 'lead_followup'  && <LeadFollowupWizard userId={userId} initialConfig={initialConfig} onComplete={onComplete} />}
          {type === 'review_request' && <ReviewRequestWizard userId={userId} initialConfig={initialConfig} onComplete={onComplete} />}
          {type === 'weekly_report'  && <WeeklyReportWizard initialConfig={initialConfig} onComplete={onComplete} />}
        </div>
      </div>
    </div>
  )
}
