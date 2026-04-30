export default function Spinner({ size = 'md', color = '#00f0ff' }) {
  const s = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }[size]
  return (
    <div className={`${s} rounded-full animate-spin`}
      style={{ borderColor: `${color}22`, borderTopColor: color }} />
  )
}
