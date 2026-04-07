'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  section: string
  title: string
  summary: string | null
  thumbnail_url: string | null
  published_at: string | null
  view_count: number
  author_name: string | null
  video_url: string | null
}

interface MoreSectionProps {
  initialArticles: Article[]
  remaining: Article[]
  section: 'domestic' | 'world' | 'video' | 'column'
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function ArticleCard({ article, section }: { article: Article; section: string }) {
  if (section === 'column') {
    return (
      <Link href={`/article/${article.id}`} className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-forest-border mb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-forest-dark flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-forest-accent text-xs font-bold">{(article.author_name ?? '?')[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-forest-dark group-hover:text-forest-accent transition-colors leading-snug line-clamp-2">{article.title}</p>
            {article.summary && <p className="text-[11px] text-forest-muted mt-1 line-clamp-2">{article.summary}</p>}
            <div className="flex items-center gap-2 mt-2">
              {article.author_name && <span className="text-[10px] bg-forest-dark text-forest-accent px-2 py-0.5 rounded-full">{article.author_name}</span>}
              <span className="text-[10px] text-forest-muted">{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/article/${article.id}`} className="group flex gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-forest-border mb-3">
      {article.thumbnail_url ? (
        <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
          <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-32 h-24 rounded-lg bg-forest-bg flex items-center justify-center">
          <span className="text-forest-muted text-2xl">📰</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-forest-dark group-hover:text-forest-accent transition-colors leading-snug line-clamp-2 text-sm">{article.title}</h3>
        {article.summary && <p className="text-xs text-forest-muted mt-1 line-clamp-2">{article.summary}</p>}
        <div className="flex items-center gap-3 mt-2">
          {article.author_name && <span className="text-[11px] text-forest-muted">{article.author_name}</span>}
          <span className="text-[11px] text-forest-muted">{formatDate(article.published_at)}</span>
          <span className="text-[11px] text-forest-muted">조회 {article.view_count.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

const sectionPath: Record<string, string> = {
  domestic: '/domestic',
  world: '/world',
  video: '/video',
  column: '/column',
}

export default function MoreSection({ initialArticles, remaining, section }: MoreSectionProps) {
  const [shown, setShown] = useState<Article[]>(initialArticles)
  const [rest, setRest] = useState<Article[]>(remaining)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (rest.length === 0) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    setShown((prev) => [...prev, ...rest.slice(0, 12)])
    setRest(rest.slice(12))
    setLoading(false)
  }, [rest])

  return (
    <div>
      <div>
        {shown.map((a) => (
          <ArticleCard key={a.id} article={a} section={section} />
        ))}
      </div>
      {rest.length > 0 ? (
        <div className="mt-4 text-center">
          <button onClick={loadMore} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-forest-dark text-forest-accent rounded-full hover:bg-forest-accent hover:text-forest-dark transition-colors duration-200 disabled:opacity-50">
            {loading ? '불러오는 중...' : `더보기 (${rest.length}건 남음)`}
          </button>
        </div>
      ) : (
        <div className="mt-3 text-center">
          <Link href={sectionPath[section] ?? '/'} className="inline-flex items-center gap-1 text-xs text-forest-muted hover:text-forest-accent transition-colors">
            전체 보러가기 →
          </Link>
        </div>
      )}
    </div>
  )
}