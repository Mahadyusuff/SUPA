'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type Entry = {
  id: string
  first_name: string
  last_name: string
  created_at: string
}

type SurnameInfo = {
  description: string | null
  image: string | null
  wikiUrl: string | null
}

const CREST_COLORS = [
  '#1d4ed8', '#7c3aed', '#b91c1c', '#047857',
  '#b45309', '#0e7490', '#9d174d', '#065f46',
]

function getSurnameColor(surname: string): string {
  let hash = 0
  for (let i = 0; i < surname.length; i++) {
    hash = (hash * 31 + surname.charCodeAt(i)) % CREST_COLORS.length
  }
  return CREST_COLORS[Math.abs(hash)]
}

function ShieldCrest({ letter, color }: { letter: string; color: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Family crest shield"
    >
      <defs>
        <linearGradient id={`shield-bg-${letter}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path
        d="M8,6 L92,6 L92,70 L50,114 L8,70 Z"
        fill={`url(#shield-bg-${letter})`}
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M16,14 L84,14 L84,66 L50,102 L16,66 Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="67"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="46"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
      >
        {letter.toUpperCase()}
      </text>
    </svg>
  )
}

export function SurnameCard({ entry }: { entry: Entry }) {
  const [info, setInfo] = useState<SurnameInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const color = getSurnameColor(entry.last_name)

  useEffect(() => {
    fetch(`/api/surname/${encodeURIComponent(entry.last_name)}`)
      .then((r) => r.json())
      .then((data: SurnameInfo) => {
        setInfo(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [entry.last_name])

  return (
    <Card>
      <CardContent className="p-6 flex gap-6">
        <div className="w-20 h-24 flex-shrink-0">
          {info?.image ? (
            <img
              src={info.image}
              alt={`${entry.last_name} family crest`}
              className="w-full h-full object-contain"
            />
          ) : (
            <ShieldCrest letter={entry.last_name[0]} color={color} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-xl">
              {entry.first_name} {entry.last_name}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
              {new Date(entry.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color }}>
            The {entry.last_name} Surname
          </p>

          {loading ? (
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded w-full" />
              <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-3 bg-muted animate-pulse rounded w-4/6" />
            </div>
          ) : info?.description ? (
            <>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {info.description}
              </p>
              {info.wikiUrl && (
                <a
                  href={info.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Read more on Wikipedia →
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No recorded history found for the {entry.last_name} surname.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
