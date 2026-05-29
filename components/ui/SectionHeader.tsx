interface SectionHeaderProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  center?: boolean
  light?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  center = false,
  light = false,
}: SectionHeaderProps) {
  const titleColor = light ? 'text-white' : 'text-op-ink'
  const descColor  = light ? 'text-white/50' : 'text-op-muted'
  const align      = center ? 'text-center' : ''

  return (
    <div className={`max-w-2xl ${center ? 'mx-auto' : ''} ${align}`}>
      {eyebrow && (
        <p className={`eyebrow mb-3 ${light ? 'text-op-accent/60' : ''}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl md:text-[2.5rem] font-fraunces font-bold ${titleColor} leading-tight mb-4`}>
        {title}{' '}
        {titleHighlight && (
          <span className="text-op-accent">{titleHighlight}</span>
        )}
      </h2>
      {description && (
        <p className={`text-sm md:text-base leading-relaxed font-jakarta ${descColor}`}>{description}</p>
      )}
    </div>
  )
}
