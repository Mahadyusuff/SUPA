import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const surname = decodeURIComponent(name).trim()

  let description: string | null = null
  let image: string | null = null
  let wikiUrl: string | null = null

  const candidates = [`${surname} (surname)`, `${surname} family`, surname]

  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`,
        {
          headers: { 'User-Agent': 'SurnameHistoryApp/1.0 (educational)' },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (data.type === 'disambiguation' || !data.extract) continue
      description = data.extract
      image = data.thumbnail?.source ?? null
      wikiUrl = data.content_urls?.desktop?.page ?? null
      break
    } catch {
      continue
    }
  }

  if (!image) {
    try {
      const searchRes = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(surname + ' coat of arms')}&srnamespace=6&srlimit=1&format=json&origin=*`,
        { next: { revalidate: 86400 } }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const results: { title: string }[] = searchData?.query?.search ?? []
        if (results.length > 0) {
          const fileName = results[0].title.replace('File:', '')
          const imgRes = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`,
            { next: { revalidate: 86400 } }
          )
          if (imgRes.ok) {
            const imgData = await imgRes.json()
            const pages = Object.values(imgData?.query?.pages ?? {}) as {
              imageinfo?: { url: string }[]
            }[]
            image = pages[0]?.imageinfo?.[0]?.url ?? null
          }
        }
      }
    } catch {
      // ignore — fall back to generated shield
    }
  }

  return NextResponse.json({ description, image, wikiUrl })
}
