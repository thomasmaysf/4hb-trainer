import { formatDay } from '../lib/dates'
import { trimNumber } from '../lib/units'

export function Chart({
  points,
  unit,
  color,
  label,
}: {
  points: { date: string; value: number }[]
  unit: string
  color: string
  label: string
}) {
  if (points.length === 0) {
    return <p className="empty">Your first entry will draw this line.</p>
  }

  const width = 640
  const height = 220
  const pad = 28
  const values = points.map((point) => point.value)
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = high - low || 1
  const min = low - span * 0.2
  const max = high + span * 0.2
  const coords = points.map((point, index) => {
    const x = pad + (points.length === 1 ? (width - pad * 2) / 2 : (index / (points.length - 1)) * (width - pad * 2))
    const y = pad + (1 - (point.value - min) / (max - min)) * (height - pad * 2)
    return { ...point, x, y }
  })
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const first = coords[0]
  const last = coords[coords.length - 1]
  const fill = `${line} L ${last.x.toFixed(1)} ${height - pad} L ${first.x.toFixed(1)} ${height - pad} Z`

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} className="chart-axis" />
        <path d={fill} fill={color} opacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((point) => (
          <circle key={point.date} cx={point.x} cy={point.y} r="4.5" fill={color} />
        ))}
      </svg>
      <div className="chart-scale">
        <span>
          {trimNumber(last.value)} {unit}
        </span>
        <span>
          {formatDay(first.date, { day: 'numeric', month: 'short' })} – {formatDay(last.date, { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <ul className="sr">
        {points.map((point) => (
          <li key={point.date}>
            {formatDay(point.date)}: {trimNumber(point.value)} {unit}
          </li>
        ))}
      </ul>
    </div>
  )
}
