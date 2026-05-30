import Image from 'next/image'

type Props = {
  imageUrl: string
  caption: string
  captionSub?: string
  width?: number
  height?: number
}

export default function ImageCard({
  imageUrl,
  caption,
  captionSub,
  width = 800,
  height = 500,
}: Props) {
  return (
    <figure
      className="overflow-hidden rounded-2xl border-2 border-op-border bg-op-surface
                 font-jakarta shadow-shadow transition-transform duration-200
                 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <Image
        src={imageUrl}
        alt={caption}
        width={width}
        height={height}
        className="w-full aspect-[16/10] object-cover object-top"
        quality={92}
      />
      <figcaption className="border-t-2 border-op-border px-5 py-4">
        <p className="text-sm font-semibold text-op-ink leading-tight">{caption}</p>
        {captionSub && (
          <p className="text-xs text-op-muted mt-1">{captionSub}</p>
        )}
      </figcaption>
    </figure>
  )
}
