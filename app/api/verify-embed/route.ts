import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const userId  = req.nextUrl.searchParams.get('userId')
  const pageUrl = req.nextUrl.searchParams.get('pageUrl')

  if (!userId || !pageUrl) {
    return NextResponse.json({ found: false })
  }

  let parsed: URL
  try {
    parsed = new URL(pageUrl)
  } catch {
    return NextResponse.json({ found: false, error: 'invalid url' })
  }

  // Security: only public http/https URLs
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ found: false, error: 'invalid url' })
  }
  const host = parsed.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' ||
      host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return NextResponse.json({ found: false, error: 'invalid url' })
  }

  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Operon-Verify/1.0' },
    })
    const html = await res.text()
    const found = html.includes(`/form/${userId}`)
    return NextResponse.json({ found })
  } catch {
    return NextResponse.json({ found: false, error: 'fetch failed' })
  }
}
