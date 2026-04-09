'use client'

import { Suspense } from 'react'
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

function WriteForm() {
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
    embed_code: '',
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
          embed_code: data.embed_code ?? '',
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

    try {
      const payload = {
        section: form.section,
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        content: form.content.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        video_url: form.video_url.trim() || null,
        embed_code: form.embed_code.trim() || null,
        author_name: form.author_name.trim() || 'VeryGoodNews 편집팀',
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        is_deleted: false,
      }

      let error
      if (editId) {
        const result = await supabase.from('articles').update(payload).eq('id', editId)
        error = result.error
      } else {
        const result = await supabase.from('articles').insert(payload)
        error = result.error
      }

      if (error) {
        console.error('저장 오류:', error)
        alert('저장 중 오류가 발생했습니다: ' + error.message)
        setSaving(false)
        return
      }

      router.push('/edit')
    } catch (e) {
      console.error('예외 발생:', e)
      alert('저장 중 예외가 발생했습니다.')
      setSaving(false)
    }
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

            {/* 유튜브 URL (영상뉴스만) */}
            {form.section === 'video' && (
              <div>
                <label className="block text-xs font-semibold text-forest-dark mb-1.5">유튜브 URL</label>
                <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://youtube.com/..."
                  className="w-full border border-forest-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-accent" />
              </div>
            )}

            {/* SNS Embed 코드 */}
            <div>
              <label className="block text-xs font-semibold text-forest-dark mb-1">
                SNS Embed 코드
                {form.section === 'world' && (
                  <span className="ml-2 text-[10px] font-normal bg-forest-dark text-forest-accent px-2 py-0.5 rounded-full">
                    해외뉴스 추천
                  </span>
                )}
              </label>
              <p className="text-[11px] text-forest-muted mb-1.5">
                Instagram · Twitter/X · Facebook 공식 embed 코드를 붙여넣으세요 (선택)
              </p>
              <textarea
                name="embed_code"
                value={form.embed_code}
                onChange={handleChange}
                rows={4}
                placeholder={`Instagram: <blockquote class="instagram-media" ...>\nTwitter: <blockquote class="twitter-tweet" ...>`}
                className="w-full border border-forest-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-forest-accent resize-y"
                style={{ color: '#0B2A1A' }}
              />
            </div>

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

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <p className="text-forest-muted text-sm">로딩 중...</p>
      </div>
    }>
      <WriteForm />
    </Suspense>
  )
}