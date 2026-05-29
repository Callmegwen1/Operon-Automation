'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2, AlertTriangle, XCircle, Send, Loader2,
  Mail, Shield, Globe, ArrowRight, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AgentConfig {
  fromName?: string
  replyToEmail?: string
}

interface CheckItem {
  id: string
  label: string
  description: string
  status: 'pass' | 'warn' | 'fail' | 'info'
  action?: { label: string; href: string; external?: boolean }
}

export default function DeliverabilityPage() {
  const [userEmail, setUserEmail] = useState('')
  const [config, setConfig] = useState<AgentConfig>({})
  const [loaded, setLoaded] = useState(false)
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<'sent' | 'error' | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email ?? '')

      const { data } = await supabase
        .from('agents')
        .select('config')
        .eq('user_id', user.id)
        .eq('type', 'lead_followup')
        .single()

      if (data?.config) setConfig(data.config as AgentConfig)
      setLoaded(true)
    }
    load()
  }, [])

  const handleTestSend = async () => {
    setSending(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/email/test-send', { method: 'POST' })
      setTestResult(res.ok ? 'sent' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setSending(false)
    }
  }

  const checks: CheckItem[] = [
    {
      id: 'infrastructure',
      label: 'Email sent via Resend',
      description: 'All Operon emails are sent through Resend — a transactional email provider with high deliverability and built-in monitoring.',
      status: 'pass',
    },
    {
      id: 'fromName',
      label: 'Sender name configured',
      description: config.fromName
        ? `Your emails go out as "${config.fromName}". Recipients see a real name, not a no-reply address.`
        : 'No sender name set. Emails will use a generic name. Set your name in Agent Settings for better open rates.',
      status: config.fromName ? 'pass' : 'warn',
      action: !config.fromName ? { label: 'Configure in Agents', href: '/dashboard/agents' } : undefined,
    },
    {
      id: 'replyTo',
      label: 'Reply-to address configured',
      description: config.replyToEmail
        ? `Replies go to ${config.replyToEmail} — customers who reply reach you directly.`
        : 'No reply-to address set. Set one in Agent Settings so customer replies reach your inbox.',
      status: config.replyToEmail ? 'pass' : 'warn',
      action: !config.replyToEmail ? { label: 'Configure in Agents', href: '/dashboard/agents' } : undefined,
    },
    {
      id: 'unsubscribe',
      label: 'Unsubscribe link included',
      description: 'Every email Operon sends includes a one-click unsubscribe link. This is required by CAN-SPAM and keeps your complaint rate low.',
      status: 'pass',
    },
    {
      id: 'domain',
      label: 'Custom sending domain (optional but recommended)',
      description: 'By default, emails come from an Operon-managed domain. For the best deliverability and brand consistency, set up a custom sending domain (e.g., hello@yourbusiness.com) in Resend. This requires a verified domain and DNS records.',
      status: 'info',
      action: { label: 'Set up in Resend', href: 'https://resend.com/domains', external: true },
    },
    {
      id: 'spf',
      label: 'SPF / DKIM (tied to your sending domain)',
      description: 'If you use a custom domain, you must add SPF and DKIM DNS records so inbox providers can verify your emails are legitimate. Resend provides these records when you add your domain. Without them, emails may land in spam.',
      status: 'info',
      action: { label: 'Resend DNS guide', href: 'https://resend.com/docs/send-with-nodejs/dns-records', external: true },
    },
  ]

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-op-navy" />
      </div>
    )
  }

  const passCount = checks.filter((c) => c.status === 'pass').length
  const warnCount = checks.filter((c) => c.status === 'warn').length

  return (
    <main className="flex-1 p-5 md:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Mail size={18} className="text-op-navy" />
          <h1 className="text-xl font-extrabold text-op-navy">Email Deliverability Health</h1>
        </div>
        <p className="text-sm text-op-muted">
          Check that emails sent on your behalf are configured for the best chance of landing in inboxes — not spam folders.
        </p>
      </div>

      {/* Summary bar */}
      <div className={`rounded-2xl border-2 px-5 py-4 mb-6 flex items-center gap-4 ${
        warnCount === 0 ? 'border-op-green/30 bg-green-50/30' : 'border-op-amber/30 bg-amber-50/20'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          warnCount === 0 ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {warnCount === 0
            ? <Shield size={22} className="text-op-green" />
            : <AlertTriangle size={22} className="text-op-amber" />
          }
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-op-navy">
            {warnCount === 0 ? 'Deliverability looks good' : `${warnCount} item${warnCount > 1 ? 's' : ''} to review`}
          </p>
          <p className="text-xs text-op-muted mt-0.5">
            {passCount} of {checks.filter(c => c.status !== 'info').length} core checks passed
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-3 mb-8">
        {checks.map(({ id, label, description, status, action }) => {
          const Icon = status === 'pass' ? CheckCircle2 : status === 'warn' ? AlertTriangle : status === 'fail' ? XCircle : Globe
          const iconColor = status === 'pass' ? 'text-op-green' : status === 'warn' ? 'text-op-amber' : status === 'fail' ? 'text-op-red' : 'text-op-muted'
          const bg = status === 'pass' ? 'bg-green-50/40' : status === 'warn' ? 'bg-amber-50/40' : status === 'info' ? 'bg-slate-50' : 'bg-red-50/40'
          return (
            <div key={id} className={`card ${bg} border`}>
              <div className="flex items-start gap-3">
                <Icon size={16} className={`${iconColor} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-op-navy mb-1">{label}</p>
                  <p className="text-xs text-op-muted leading-relaxed">{description}</p>
                  {action && (
                    <div className="mt-2">
                      {action.external ? (
                        <a
                          href={action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-op-navy hover:underline"
                        >
                          {action.label} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <Link href={action.href} className="inline-flex items-center gap-1 text-xs font-semibold text-op-navy hover:underline">
                          {action.label} <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Test send */}
      <div className="card border border-op-border">
        <div className="flex items-start gap-3 mb-4">
          <Send size={16} className="text-op-navy mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-op-navy">Send a test email</p>
            <p className="text-xs text-op-muted mt-0.5">
              Sends a real test email to <strong>{userEmail}</strong> using your current agent configuration. Check your inbox and spam folder to confirm delivery.
            </p>
          </div>
        </div>

        {testResult === 'sent' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4">
            <CheckCircle2 size={14} className="text-op-green shrink-0" />
            <p className="text-xs text-op-green font-medium">Test email sent — check your inbox (and spam folder if you don&apos;t see it).</p>
          </div>
        )}
        {testResult === 'error' && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
            <XCircle size={14} className="text-op-red shrink-0" />
            <p className="text-xs text-op-red font-medium">Test send failed. Try again or contact support at ceo@operonauto.com.</p>
          </div>
        )}

        <button
          onClick={handleTestSend}
          disabled={sending}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {sending ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {/* Footer note */}
      <p className="text-xs text-op-muted mt-6 leading-relaxed">
        Deliverability depends on many factors including your sending domain, recipient engagement, and email content.
        If emails are landing in spam, the most impactful step is setting up a verified custom domain in Resend with proper SPF and DKIM records.
      </p>
    </main>
  )
}
