// app/video/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import AdSlot from '@/components/AdSlot'
import MoreSection from '@/components/MoreSection'

interface Article {
  id: string; section: string; title: string; summary: string | null
  thumbnail_url: string | null; published_at: string | null
  view_count: number; author_name: string | null; video_url: string | null
}
interface Ad {
  id: string; slot_key: string; ad_type: 'direct' | 'adsense' | 'none'
  image_url: string | null; link_url: string | null; adsense_slot_id: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function VideoPage() {
  const [{ data: articlesData }, { data: adData }] = await Promise.all([
    supabaseAdmin.from('articles').select('id, section, title, summary, thumbnail_url, published_at, view_count, author_name, video_url').eq('section', 'video').eq('status', 'published').eq('is_deleted', false).order('published_at', { ascending: false }).limit(24),
    supabaseAdmin.from('ads').select('*').eq('slot_key', 'video_sidebar').single(),
  ])
  const articles = (articlesData ?? []) as Article[]
  const ad = adData as Ad | null

  return (
    <main className="min-h-screen bg-forest-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-forest-accent flex items-baseline gap-3">
          <span className="text-[11px] font-bold tracking-[0.2em] text-forest-accent uppercase">VIDEO</span>
          <h1 className="font-serif text-2xl font-bold text-forest-dark">영상뉴스</h1>
          <span className="text-xs text-forest-muted ml-auto">눈으로 보는 따뜻한 뉴스</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {articles.length === 0 ? (
              <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-forest-border text-sm text-forest-muted">아직 영상뉴스가 없습니다.</div>
            ) : (
              <MoreSection initialArticles={articles.slice(0, 12)} remaining={articles.slice(12)} section="video" />
            )}
          </div>
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.15em] text-forest-muted uppercase mb-2">Advertisement</p>
              <AdSlot ad={ad} fallbackClassName="min-h-[250px]" />
            </div>
            <div className="bg-white rounded-xl p-4 border border-forest-border shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-forest-accent uppercase mb-3">MORE NEWS</p>
              <div className="space-y-2">
                {[{ label: '국내뉴스', href: '/domestic' }, { label: '해외뉴스', href: '/world' }, { label: '기획칼럼', href: '/column' }].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm text-forest-dark hover:text-forest-accent transition-colors py-1">
                    <span>{item.label}</span><span className="ml-auto text-forest-muted text-xs">{">"}</span>
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

export const metadata = { title: '영상뉴스 | VeryGoodNews', description: '눈으로 보는 따뜻한 뉴스' }