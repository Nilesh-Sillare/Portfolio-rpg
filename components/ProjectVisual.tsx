type Props = { name: string; screenshot?: string; className?: string };

export default function ProjectVisual({ name, screenshot, className = "" }: Props) {
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-[#1a0b1f] via-[#120818] to-[#2a0a14] ${className}`}
    >
      {screenshot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={screenshot} alt={`${name} screenshot`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <span className="text-6xl font-semibold text-rose-500/70">{name[0]}</span>
          <span className="text-sm text-zinc-500">Screenshot coming soon</span>
        </div>
      )}
    </div>
  );
}