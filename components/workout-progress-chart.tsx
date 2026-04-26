'use client'

import { useState, useMemo } from 'react'

export type ExerciseLog = {
  logged_at: string
  max_weight: number
  total_volume: number
  unit: string
}

type Props = {
  exerciseData: Record<string, ExerciseLog[]>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function SingleDataPoint({
  value,
  label,
  date,
}: {
  value: number
  label: string
  date: string
}) {
  return (
    <div className="flex items-center justify-center h-52 text-center">
      <div>
        <p className="text-5xl font-extrabold text-green-600 mb-2">
          {value.toLocaleString()}
        </p>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">on {date}</p>
        <p className="text-xs text-muted-foreground/60 mt-4">
          Log more sessions to see your progression chart
        </p>
      </div>
    </div>
  )
}

function LineChart({ data, unit }: { data: { x: string; y: number }[]; unit: string }) {
  if (data.length < 2) {
    return (
      <SingleDataPoint
        value={data[0]?.y ?? 0}
        label={unit}
        date={data[0]?.x ?? ''}
      />
    )
  }

  const W = 560
  const H = 200
  const PX = 56
  const PY = 24

  const vals = data.map(d => d.y)
  const minVal = Math.min(...vals)
  const maxVal = Math.max(...vals)
  const range = maxVal - minVal || maxVal || 1

  const innerW = W - PX * 2
  const innerH = H - PY * 2

  const xScale = (i: number) =>
    PX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yScale = (v: number) => PY + (1 - (v - minVal) / range) * innerH

  const pts = data.map((d, i) => ({ x: xScale(i), y: yScale(d.y), val: d.y, label: d.x }))

  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(PY + innerH).toFixed(1)} L${PX.toFixed(1)},${(PY + innerH).toFixed(1)} Z`

  const yTicks = [0, 1, 2, 3].map(i => {
    const v = minVal + (range / 3) * (3 - i)
    return { v, y: PY + (i / 3) * innerH }
  })

  const xStep = Math.max(1, Math.ceil(data.length / 5))
  const xTicks = pts.filter((_, i) => i % xStep === 0 || i === pts.length - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Progress chart">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PX}
            y1={t.y}
            x2={W - PX}
            y2={t.y}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
            strokeDasharray="4,3"
          />
          <text
            x={PX - 6}
            y={t.y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="10"
            fill="currentColor"
            opacity="0.45"
          >
            {t.v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#areaFill)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#16a34a"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* X labels */}
      {xTicks.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={PY + innerH + 16}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.45"
        >
          {p.label}
        </text>
      ))}

      {/* Axes */}
      <line
        x1={PX}
        y1={PY}
        x2={PX}
        y2={PY + innerH}
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
      <line
        x1={PX}
        y1={PY + innerH}
        x2={W - PX}
        y2={PY + innerH}
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
    </svg>
  )
}

export function WorkoutProgressChart({ exerciseData }: Props) {
  const exercises = useMemo(() => Object.keys(exerciseData).sort(), [exerciseData])
  const [selected, setSelected] = useState(exercises[0] ?? '')
  const [mode, setMode] = useState<'weight' | 'volume'>('weight')

  const logs = exerciseData[selected] ?? []
  const unit = logs[0]?.unit ?? 'lbs'

  const chartData = useMemo(
    () =>
      logs.map(l => ({
        x: formatDate(l.logged_at),
        y: mode === 'weight' ? l.max_weight : l.total_volume,
      })),
    [logs, mode]
  )

  const maxWeight = logs.length ? Math.max(...logs.map(l => l.max_weight)) : 0
  const maxVolume = logs.length ? Math.max(...logs.map(l => l.total_volume)) : 0
  const sessions = logs.length

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            Exercise
          </label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-48"
          >
            {exercises.map(ex => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            Metric
          </label>
          <div className="flex rounded-md border border-input overflow-hidden text-sm">
            <button
              onClick={() => setMode('weight')}
              className={`px-3 py-2 transition-colors ${
                mode === 'weight'
                  ? 'bg-green-600 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Max Weight
            </button>
            <button
              onClick={() => setMode('volume')}
              className={`px-3 py-2 border-l border-input transition-colors ${
                mode === 'volume'
                  ? 'bg-green-600 text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          {selected} —{' '}
          {mode === 'weight' ? `Max weight (${unit})` : `Total volume (${unit})`}
        </p>
        <LineChart data={chartData} unit={unit} />
      </div>

      {/* Personal Records */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Personal Records — {selected}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Max Weight', value: `${maxWeight} ${unit}` },
            { label: 'Best Volume', value: `${maxVolume.toLocaleString()} ${unit}` },
            { label: 'Sessions', value: sessions.toString() },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
              <p className="text-xl font-bold text-green-600">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
