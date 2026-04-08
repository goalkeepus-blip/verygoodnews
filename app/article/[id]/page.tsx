// app/article/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { supabaseAdmin } from '@/lib/supabase-server'
import AdSlot from '@/components/AdSlot'

interface Article {
  id: string
  section: string
  title: string
  summary: string | null
  content: string | null
  thumbnail_url: string | null
  video_url: string | null
  embed_code: string | null
  published_at: string | null
  view_count: number
  author_name: string | null
}

interface Ad {
  id: string
  slot_key: string
  ad_type: 'direct' | 'adsense' | 'none'
  image_url: string | null
  link_url: string | null
  adsense_slot_id: string | null
}

const SECTION_LABEL: Record<string, string> = {
  domestic: '국내뉴스',
  world: '해외뉴스',
  video: '영상뉴스',
  column: '기획·칼럼',
}

const SECTION_PATH: Record<string, string> = {
  domestic: '/domestic',
  world: '/world',
  video: '/video',
  column: '/column',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function getYoutubeId(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function getEmbedType(code: string | null): 'instagram' | 'twitter' | 'other' | null {
  if (!code) return null
  if (code.includes('instagram-media')) return 'instagram'
  if (code.includes('twitter-tweet') || code.includes('twitter.com')) return 'twitter'
  return 'other'
}

function RelatedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex gap-3 bg-white rounded-xl p-3 border border-forest-border hover:shadow-md transition-shadow"
    >
      {article.thumbnail_url ? (
        <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-100">
          <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-20 h-14 rounded-lg bg-forest-bg flex items-center justify-center">
          <span className="text-lg">📰</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-forest-dark group-hover:text-forest-accent transition-colors line-clamp-2 leading-snug">
          {article.title}
        </p>
        <p className="text-[10px] text-forest-muted mt-1">{formatDate(article.published_at)}</p>
      </div>
    </Link>
  )
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const { data: articleData } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .single()

  if (!articleData) notFound()

  const article = articleData as Article

  await supabaseAdmin
    .from('articles')
    .update({ view_count: article.view_count + 1 })
    .eq('id', params.id)

  const { data: relatedData } = await supabaseAdmin
    .from('articles')
    .select('id, section, title, summary, thumbnail_url, published_at, view_count, author_name, video_url, content, embed_code')
    .eq('section', article.section)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .neq('id', params.id)
    .order('published_at', { ascending: false })
    .limit(3)

  const { data: adData } = await supabaseAdmin
    .from('ads')
    .select('*')
    .eq('slot_key', 'article_sidebar')
    .single()

  const related = (relatedData ?? []) as Article[]
  const ad = adData as Ad | null
  const ytId = getYoutubeId(article.video_url)
  const embedType = getEmbedType(article.embed_code)

  return (
    <main className="min-h-screen bg-forest-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-8">

        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-xs text-forest-muted mb-6">
          <Link href="/" className="hover:text-forest-accent transition-colors">홈</Link>
          <span>›</span>
          <Link href={SECTION_PATH[article.section] ?? '/'} className="hover:text-forest-accent transition-colors">
            {SECTION_LABEL[article.section] ?? article.section}
          </Link>
          <span>›</span>
          <span className="text-forest-dark line-clamp-1">{article.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* 본문 */}
          <article className="bg-white rounded-xl border border-forest-border shadow-sm overflow-hidden">

            {/* 기사 헤더 */}
            <div className="p-6 md:p-8 border-b border-forest-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-widest text-forest-accent uppercase bg-forest-dark px-2 py-0.5 rounded-full">
                  {SECTION_LABEL[article.section]}
                </span>
              </div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-forest-dark leading-snug mb-3">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-sm text-forest-muted leading-relaxed border-l-2 border-forest-accent pl-3">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-forest-muted">
                {article.author_name && (
                  <span className="font-medium text-forest-dark">{article.author_name}</span>
                )}
                <span>{formatDate(article.published_at)}</span>
                <span>조회 {article.view_count.toLocaleString()}</span>
              </div>
            </div>

            {/* 썸네일 or 유튜브 */}
            {ytId ? (
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : article.thumbnail_url ? (
              <div className="w-full aspect-video overflow-hidden bg-gray-100">
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* 본문 내용 */}
            <div className="p-6 md:p-8">
              {article.content ? (
                <div
                  className="prose prose-sm max-w-none text-forest-dark leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-forest-muted text-sm">본문 내용이 없습니다.</p>
              )}
            </div>

            {/* SNS Embed 섹션 */}
            {article.embed_code && (
              <div className="px-6 md:px-8 pb-8 border-t border-forest-border pt-6">
                <p className="text-[10px] font-bold tracking-widest text-forest-accent uppercase mb-4">
                  원문 SNS 게시물
                </p>
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: article.embed_code }}
                />
                {/* Instagram embed 스크립트 */}
                {embedType === 'instagram' && (
                  <Script
                    src="https://www.instagram.com/embed.js"
                    strategy="lazyOnload"
                    onLoad={() => {
                      if (typeof window !== 'undefined' && (window as any).instgrm) {
                        (window as any).instgrm.Embeds.process()
                      }
                    }}
                  />
                )}
                {/* Twitter/X embed 스크립트 */}
                {embedType === 'twitter' && (
                  <Script
                    src="https://platform.twitter.com/widgets.js"
                    strategy="lazyOnload"
                  />
                )}
              </div>
            )}

            {/* 하단 네비 */}
            <div className="px-6 md:px-8 pb-6 pt-2 border-t border-forest-border">
              <Link
                href={SECTION_PATH[article.section] ?? '/'}
                className="inline-flex items-center gap-1 text-xs text-forest-muted hover:text-forest-accent transition-colors"
              >
                ← {SECTION_LABEL[article.section]} 목록으로
              </Link>
            </div>
          </article>

          {/* 사이드바 */}
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.15em] text-forest-muted uppercase mb-2">Advertisement</p>
              <AdSlot ad={ad} fallbackClassName="min-h-[250px]" />
            </div>
            {related.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-forest-border shadow-sm">
                <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-forest-border">
                  <span className="text-[10px] font-bold tracking-widest text-forest-accent uppercase">RELATED</span>
                  <span className="text-sm font-bold text-forest-dark">관련 기사</span>
                </div>
                <div className="space-y-3">
                  {related.map((a) => <RelatedCard key={a.id} article={a} />)}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl p-4 border border-forest-border shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-forest-accent uppercase mb-3">MORE NEWS</p>
              <div className="space-y-2">
                {[
                  { label: '국내뉴스', href: '/domestic', emoji: '🇰🇷' },
                  { label: '해외뉴스', href: '/world', emoji: '🌍' },
                  { label: '영상뉴스', href: '/video', emoji: '🎬' },
                  { label: '기획·칼럼', href: '/column', emoji: '✍️' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm text-forest-dark hover:text-forest-accent transition-colors py-1">
                    <span>{item.emoji}</span><span>{item.label}</span>
                    <span className="ml-auto text-forest-muted text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('title, summary')
    .eq('id', params.id)
    .single()

  return {
    title: data ? `${data.title} | VeryGoodNews` : 'VeryGoodNews',
    description: data?.summary ?? '세상에서 가장 무해하고 따뜻한 뉴스',
  }
}