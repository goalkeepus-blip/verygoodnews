'use client'

import AdminGuard from '@/components/AdminGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const SECTIONS = [
  { value: 'domestic', label: '국내뉴스' },
  { value: 'world', label: '해외뉴스' },
  { value: 'video', label: '영상뉴스' },
  { value: 'column', label: '기획·칼럼' },
]

export default function WritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [form, setForm] = useState({
    section: 'domestic',
    title: '',
    summary: '',
    content: '',
    thumbnail_url: '',
    video_url: '',
    author_name: '',
    status: 'published',
  })
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)

  useEffect(() => {
    if (!editId) return
    setLoadingEdit(true)
    supabase.from('articles').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) {
        setForm({
          section: data.section,
          title: data.title,
          summary: data.summary ?? '',
          content: data.content ?? '',
          thumbnail_url: data.thumbnail_url ?? '',
          video_url: data.video_url ?? '',
          author_name: data.author_name ?? '',
          status: data.status,
        })
      }
      setLoadingEdit(false)
    })
  }, [editId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (status: 'published' | 'draft') => {
    if (!form.title.trim()) { alert('제목을 입력하세요.'); return }
    setSaving(true)

    const payload = {
      section: form.section,
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      content: form.content.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      video_url: form.video_url.trim() || null,
      author_name: form.author_name.trim() || 'VeryGoodNews 편집팀',
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      is_deleted: false,
    }

    if (editId) {
      await supabase.from('articles').update(payload).eq('id', editId)
    } else {
      await supabase.from('articles').insert(payload)
    }

    setSaving(false)
    router.push('/edit')
  }

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <p className="text-forest-muted text-sm">기사 불러오는 중...</p>
      </div>
    )
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-forest-bg">
        <div className="max-w-[800px] mx-auto px-4 py-8">

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-forest-dark">
              {editId ? '기사 수정' : '새 기사 작성'}
            </h1>
            <button onClick={() => router.push('/edit')} className="text-sm text-forest-muted hover:text-forest-dark transition-colors">
              ← 목록으로
            </button>
          </div>

          <div className="bg-white rounded-xl border border-forest-border p-6 space-y-5">

            {/* 섹션 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">섹션 *</label>
              <select name="section" value={form.section} onChange={handleChange}
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent">
                {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">제목 *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="기사 제목을 입력하세요"
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent" />
            </div>

            {/* 요약 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">요약</label>
              <textarea name="summary" value={form.summary} onChange={handleChange} rows={2} placeholder="한 줄 요약 (선택)"
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent resize-none" />
            </div>

            {/* 본문 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">본문</label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={10} placeholder="기사 본문을 입력하세요"
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent resize-y" />
            </div>

            {/* 썸네일 URL */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">썸네일 URL</label>
              <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} placeholder="https://..."
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent" />
            </div>

            {/* 영상 URL (영상뉴스만) */}
            {form.section === 'video' && (
              <div>
                <label className="block text-xs font-semibold text-forest-dark mb-1.5">유튜브 URL</label>
                <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://youtube.com/..."
                  className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent" />
              </div>
            )}

            {/* 작성자 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1.5">작성자</label>
              <input name="author_name" value={form.author_name} onChange={handleChange} placeholder="VeryGoodNews 편집팀"
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent" />
            </div>

          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={() => handleSave('draft')} disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold border border-forest-border rounded-full text-forest-muted hover:border-forest-accent hover:text-forest-dark transition-colors disabled:opacity-50">
              임시저장
            </button>
            <button onClick={() => handleSave('published')} disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold bg-forest-dark text-forest-accent rounded-full hover:bg-forest-accent hover:text-forest-dark transition-colors disabled:opacity-50">
              {saving ? '저장 중...' : (editId ? '수정 완료' : '발행하기')}
            </button>
          </div>

        </div>
      </main>
    </AdminGuard>
  )
}