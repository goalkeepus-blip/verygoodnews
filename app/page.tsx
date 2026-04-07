// app/page.tsx
// VeryGoodNews 메인 페이지 — B안 레이아웃
// 상단 2분할: 영상뉴스 | 국내뉴스
// 하단 3분할: 해외뉴스 | 기획칼럼 | 광고사이드바

import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import MoreSection from '@/components/MoreSection'

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
interface Article {
  id: string
  section: 'domestic' | 'world' | 'video' | 'column'
  title: string
  summary: string | null
  thumbnail_url: string | null
  published_at: string | null
  view_count: number
  author_name: string | null
  video_url: string | null
}

interface Ad {
  id: string
  slot_key: string
  ad_type: 'direct' | 'adsense' | 'none'
  image_url: string | null
  link_url: string | null
  adsense_slot_id: string | null
}

// ─────────────────────────────────────────
// 서버 데이터 패치
// ─────────────────────────────────────────
async function fetchArticles(section: string, limit = 12): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('id, section, title, summary, thumbnail_url, published_at, view_count, author_name, video_url')
    .eq('section', section)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`fetchArticles(${section}) error:`, error.message)
    return []
  }
  return (data ?? []) as Article[]
}

async function fetchAd(slotKey: string): Promise<Ad | null> {
  const { data } = await supabaseAdmin
    .from('ads')
    .select('*')
    .eq('slot_key', slotKey)
    .single()
  return data as Ad | null
}

// ─────────────────────────────────────────
// 날짜 포맷 유틸
// ─────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ─────────────────────────────────────────
// 유튜브 embed ID 추출
// ─────────────────────────────────────────
function getYoutubeId(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

// ─────────────────────────────────────────
// 컴포넌트: 섹션 헤더
// ─────────────────────────────────────────
function SectionHeader({
  label,
  title,
  href,
}: {
  label: string
  title: string
  href: string
}) {
  return (
    <div className="flex items-baseline justify-between mb-4 pb-2 border-b-2 border-forest-accent">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-forest-accent uppercase">
          {label}
        </span>
        <h2 className="font-serif text-xl font-bold text-forest-dark">{title}</h2>
      </div>
      <Link
        href={href}
        className="text-xs text-forest-muted hover:text-forest-accent transition-colors"
      >
        더보기 →
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────
// 컴포넌트: 영상 카드 (유튜브 embed)
// ─────────────────────────────────────────
function VideoCard({ article }: { article: Article }) {
  const ytId = getYoutubeId(article.video_url)
  const embedSrc = ytId ? `https://www.youtube.com/embed/${ytId}` : null
  const externalHref = article.video_url ?? '#'

  return (
    <a
      href={externalHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-forest-border"
    >
      {embedSrc ? (
        <div className="relative w-full aspect-video pointer-events-none">
          <iframe
            src={embedSrc}
            title={article.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-forest-dark flex items-center justify-center">
          <span className="text-forest-accent text-3xl">▶</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-forest-dark line-clamp-2 group-hover:text-forest-accent transition-colors leading-snug">
          {article.title}
        </p>
        <p className="text-[11px] text-forest-muted mt-1">{formatDate(article.published_at)}</p>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────
// 컴포넌트: 기사 리스트 아이템 (국내/해외)
// ─────────────────────────────────────────
function ArticleItem({
  article,
  big = false,
}: {
  article: Article
  big?: boolean
}) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex gap-3 py-3 border-b border-forest-border last:border-b-0 hover:bg-forest-bg/60 transition-colors rounded-lg px-1 -mx-1"
    >
      {article.thumbnail_url && (
        <div
          className={`flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 ${big ? 'w-28 h-20' : 'w-20 h-14'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.thumbnail_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-forest-dark group-hover:text-forest-accent transition-colors leading-snug ${big ? 'text-sm' : 'text-xs'} line-clamp-2`}
        >
          {article.title}
        </p>
        {big && article.summary && (
          <p className="text-[11px] text-forest-muted mt-1 line-clamp-1">{article.summary}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {article.author_name && (
            <span className="text-[10px] text-forest-muted">{article.author_name}</span>
          )}
          <span className="text-[10px] text-forest-muted">{formatDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────
// 컴포넌트: 칼럼 카드
// ─────────────────────────────────────────
function ColumnCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-forest-border"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-forest-dark flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-forest-accent text-xs font-bold">
            {(article.author_name ?? '?')[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-forest-dark group-hover:text-forest-accent transition-colors leading-snug line-clamp-2">
            {article.title}
          </p>
          {article.summary && (
            <p className="text-[11px] text-forest-muted mt-1 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {article.author_name && (
              <span className="text-[10px] bg-forest-dark text-forest-accent px-2 py-0.5 rounded-full">
                {article.author_name}
              </span>
            )}
            <span className="text-[10px] text-forest-muted">{formatDate(article.published_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────
// 메인 페이지 (Server Component)
// ─────────────────────────────────────────
export default async function HomePage() {
  const [videos, domesticAll, worldAll, columnAll, sidebarAd] = await Promise.all([
    fetchArticles('video', 3),
    fetchArticles('domestic', 12),
    fetchArticles('world', 12),
    fetchArticles('column', 12),
    fetchAd('main_sidebar'),
  ])

  return (
    <main className="min-h-screen bg-forest-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-10">

        {/* ════════════════════════════════════
            상단 2분할: 영상뉴스 | 국내뉴스
        ════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 왼쪽: 영상뉴스 */}
          <div>
            <SectionHeader label="VIDEO" title="영상뉴스" href="/video" />
            {videos.length === 0 ? (
              <EmptyState message="아직 영상뉴스가 없습니다." />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {videos.map((v) => (
                  <VideoCard key={v.id} article={v} />
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 국내뉴스 */}
          <div>
            <SectionHeader label="DOMESTIC" title="국내뉴스" href="/domestic" />
            {domesticAll.length === 0 ? (
              <EmptyState message="아직 국내뉴스가 없습니다." />
            ) : (
              <MoreSection
                initialArticles={domesticAll.slice(0, 5)}
                remaining={domesticAll.slice(5)}
                section="domestic"
              />
            )}
          </div>
        </section>

        {/* ════════════════════════════════════
            하단 3분할: 해외뉴스 | 기획칼럼 | 광고
        ════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px] gap-8">

          {/* 해외뉴스 */}
          <div>
            <SectionHeader label="WORLD" title="해외뉴스" href="/world" />
            {worldAll.length === 0 ? (
              <EmptyState message="아직 해외뉴스가 없습니다." />
            ) : (
              <MoreSection
                initialArticles={worldAll.slice(0, 6)}
                remaining={worldAll.slice(6)}
                section="world"
              />
            )}
          </div>

          {/* 기획칼럼 */}
          <div>
            <SectionHeader label="COLUMN" title="기획·칼럼" href="/column" />
            {columnAll.length === 0 ? (
              <EmptyState message="아직 칼럼이 없습니다." />
            ) : (
              <MoreSection
                initialArticles={columnAll.slice(0, 6)}
                remaining={columnAll.slice(6)}
                section="column"
              />
            )}
          </div>

          {/* 광고 사이드바 */}
          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <p className="text-[10px] tracking-[0.15em] text-forest-muted uppercase mb-2">
              Advertisement
            </p>
            <AdSlot ad={sidebarAd} fallbackClassName="min-h-[250px]" />
            <AdSlot ad={null} fallbackClassName="min-h-[200px]" />
          </aside>
        </section>

      </div>
    </main>
  )
}

// ─────────────────────────────────────────
// 빈 상태 컴포넌트
// ─────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-sm text-forest-muted bg-white rounded-xl border border-forest-border">
      {message}
    </div>
  )
}