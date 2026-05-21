interface LegalPageProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <section className="section-pad bg-op-bg min-h-screen">
      <div className="container-wide max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-op-muted uppercase tracking-wide mb-2 font-inter">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold font-manrope text-op-navy mb-2">{title}</h1>
          <p className="text-sm text-op-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="bg-white rounded-2xl border border-op-border shadow-card p-6 sm:p-10">
          <div className="prose prose-sm max-w-none text-op-body [&_h2]:font-manrope [&_h2]:text-op-navy [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-manrope [&_h3]:text-op-navy [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-op-muted [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-op-muted [&_ul]:mb-4 [&_li]:mb-1.5">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
