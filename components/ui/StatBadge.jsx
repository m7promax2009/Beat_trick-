export default function StatBadge({ label, value, color = '#00f0ff', icon }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-beat-card border border-beat-border rounded-lg p-3 text-center min-w-[80px]">
      {icon && <span className="text-xl leading-none">{icon}</span>}
      <span className="font-display font-bold text-lg leading-none" style={{ color, textShadow: `0 0 12px ${color}` }}>
        {value}
      </span>
      <span className="text-white/30 text-[0.65rem] tracking-widest uppercase">{label}</span>
    </div>
  )
}
