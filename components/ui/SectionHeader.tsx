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
  const titleColor = light ? 'text-white' : 'text-op-navy'
  const eyebrowColor = light ? 'text-blue-300' : 'text-op-blue'
  const descColor = light ? 'text-white/70' : 'text-op-muted'
  const align = center ? 'text-center' : ''

  return (
    <div className={`max-w-2xl ${center ? 'mx-auto' : ''} ${align}`}>
      {eyebrow && (
        <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${eyebrowColor} font-inter`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl md:text-4xl font-extrabold font-manrope ${titleColor} leading-tight mb-4`}>
        {title}{' '}
        {titleHighlight && (
          <span className="text-op-amber">{titleHighlight}</span>
        )}
      </h2>
      {description && (
        <p className={`text-base md:text-lg leading-relaxed ${descColor}`}>{description}</p>
      )}
    </div>
  )
}
