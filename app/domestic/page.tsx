// app/domestic/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import AdSlot from '@/components/AdSlot'
import MoreSection from '@/components/MoreSection'

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

interface Ad {
  id: string
  slot_key: string
  ad_type: 'direct' | 'adsense' | 'none'
  image_url: string | null
  link_url: string | null
  adsense_slot_id: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function SidebarItem({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex gap-3 py-2 border-b border-forest-border last:border-b-0">
      {article.thumbnail_url && (
        <div className="flex-shrink-0 w-14 h-12 rounded-lg overflow-hidden bg-gray-100">
          <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-forest-dark group-hover:text-forest-accent transition-colors line-clamp-2 leading-snug">{article.title}</p>
        <p className="text-[10px] text-forest-muted mt-1">{formatDate(article.published_at)}</p>
      </div>
    </Link>
  )
}

export default async function DomesticPage() {
  const [{ data: articlesData }, { data: sidebarData }, { data: adData }] = await Promise.all([
    supabaseAdmin.from('articles').select('id, section, title, summary, thumbnail_url, published_at, view_count, author_name, video_url').eq('section', 'domestic').eq('status', 'published').eq('is_deleted', false).order('published_at', { ascending: false }).limit(24),
    supabaseAdmin.from('articles').select('id, title, thumbnail_url, published_at, video_url, summary, view_count, author_name, section').eq('section', 'domestic').eq('status', 'published').eq('is_deleted', false).order('published_at', { ascending: false }).limit(5),
    supabaseAdmin.from('ads').select('*').eq('slot_key', 'domestic_sidebar').single(),
  ])

  const articles = (articlesData ?? []) as Article[]
  const sidebarArticles = (sidebarData ?? []) as Article[]
  const ad = adData as Ad | null

  return (
    <main className="min-h-screen bg-forest-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-forest-accent flex items-baseline gap-3">
          <span className="text-[11px] font-bold tracking-[0.2em] text-forest-accent uppercase">DOMESTIC</span>
          <h1 className="font-serif text-2xl font-bold text-forest-dark">국내뉴스</h1>
          <span className="text-xs text-forest-muted ml-auto">따뜻한 국내 소식을 전합니다</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {articles.length === 0 ? (
              <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-forest-border text-sm text-forest-muted">아직 국내뉴스가 없습니다.</div>
            ) : (
              <MoreSection initialArticles={articles.slice(0, 12)} remaining={articles.slice(12)} section="domestic" />
            )}
          </div>
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.15em] text-forest-muted uppercase mb-2">Advertisement</p>
              <AdSlot ad={ad} fallbackClassName="min-h-[250px]" />
            </div>
            {sidebarArticles.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-forest-border shadow-sm">
                <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-forest-border">
                  <span className="text-[10px] font-bold tracking-widest text-forest-accent uppercase">LATEST</span>
                  <span className="text-sm font-bold text-forest-dark">최신 국내뉴스</span>
                </div>
                {sidebarArticles.map((a) => <SidebarItem key={a.id} article={a} />)}
              </div>
            )}
            <div className="bg-white rounded-xl p-4 border border-forest-border shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-forest-accent uppercase mb-3">MORE NEWS</p>
              <div className="space-y-2">
                {[
                  { label: '해외뉴스', href: '/world' },
                  { label: '영상뉴스', href: '/video' },
                  { label: '기획칼럼', href: '/column' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm text-forest-dark hover:text-forest-accent transition-colors py-1">
                    <span>{item.label}</span>
                    <span className="ml-auto text-forest-muted text-xs">{">"}</span>
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

export const metadata = {
  title: '국내뉴스 | VeryGoodNews',
  description: '따뜻한 국내 소식을 전합니다',
}