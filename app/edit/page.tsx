'use client'

import AdminGuard from '@/components/AdminGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Article {
  id: string
  section: string
  title: string
  status: 'published' | 'draft'
  published_at: string | null
  view_count: number
  author_name: string | null
}

const SECTION_LABEL: Record<string, string> = {
  domestic: '국내뉴스',
  world: '해외뉴스',
  video: '영상뉴스',
  column: '기획·칼럼',
}

export default function EditPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const fetchArticles = async () => {
    setLoading(true)
    let query = supabase
      .from('articles')
      .select('id, section, title, status, published_at, view_count, author_name')
      .eq('is_deleted', false)
      .order('published_at', { ascending: false })

    if (filter !== 'all') query = query.eq('section', filter)

    const { data } = await query
    setArticles((data ?? []) as Article[])
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [filter])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제할까요?')) return
    setDeleting(id)
    await supabase.from('articles').update({ is_deleted: true }).eq('id', id)
    await fetchArticles()
    setDeleting(null)
  }

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'published' ? 'draft' : 'published'
    await supabase.from('articles').update({ status: next }).eq('id', id)
    await fetchArticles()
  }

  function formatDate(iso: string | null) {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-forest-bg">
        <div className="max-w-[1100px] mx-auto px-4 py-8">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-forest-dark">관리자 대시보드</h1>
              <p className="text-sm text-forest-muted mt-1">기사를 작성·수정·삭제할 수 있습니다</p>
            </div>
            <Link
              href="/edit/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-dark text-forest-accent rounded-full text-sm font-semibold hover:bg-forest-accent hover:text-forest-dark transition-colors"
            >
              + 새 기사 작성
            </Link>
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[['all', '전체'], ['domestic', '국내'], ['world', '해외'], ['video', '영상'], ['column', '칼럼']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === val ? 'bg-forest-dark text-forest-accent' : 'bg-white text-forest-muted border border-forest-border hover:border-forest-accent'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 기사 목록 */}
          <div className="bg-white rounded-xl border border-forest-border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-sm text-forest-muted">불러오는 중...</div>
            ) : articles.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-forest-muted">기사가 없습니다.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-forest-bg border-b border-forest-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forest-muted">섹션</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forest-muted">제목</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forest-muted">상태</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forest-muted">날짜</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-forest-muted">조회</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-forest-muted">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.id} className="border-b border-forest-border last:border-b-0 hover:bg-forest-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-[11px] bg-forest-dark text-forest-accent px-2 py-0.5 rounded-full">
                          {SECTION_LABEL[a.section] ?? a.section}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[300px]">
                        <p className="truncate text-forest-dark font-medium">{a.title}</p>
                        {a.author_name && <p className="text-[11px] text-forest-muted mt-0.5">{a.author_name}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(a.id, a.status)}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${a.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                          {a.status === 'published' ? '발행됨' : '임시저장'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-forest-muted text-xs">{formatDate(a.published_at)}</td>
                      <td className="px-4 py-3 text-forest-muted text-xs">{a.view_count.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/edit/write?id=${a.id}`)}
                            className="text-xs text-forest-accent bg-forest-dark px-3 py-1 rounded-full hover:opacity-80 transition-opacity"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting === a.id}
                            className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {deleting === a.id ? '...' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </AdminGuard>
  )
}