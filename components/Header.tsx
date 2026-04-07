// components/Header.tsx
// VeryGoodNews 헤더 + 배너 슬라이더 컴포넌트
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: '국내뉴스', href: '/domestic' },
  { label: '해외뉴스', href: '/world' },
  { label: '영상뉴스', href: '/video' },
  { label: '기획·칼럼', href: '/column' },
]

// ── 슬라이드 데이터 ──────────────────────────────────────────
// 실제 배포 시: image 경로를 /public/images/slide1.jpg 등으로 변경
const SLIDES = [
  {
    id: 0,
    bg: '#0a1a10',
    accentColor: '#4ADE80',
    label: 'VERY GOOD NEWS',
    image: '/images/slide1-people.jpg', // 다양한 인종 사람들 사진
    imagePosition: 'right',
    title: '소소하고 작은 행복들을\n전달하는 Very Good News',
    titleAccent: 'Very Good News',
    sub: '세상의 따뜻한 이야기를 전합니다',
    barColor: '#4ADE80',
  },
  {
    id: 1,
    bg: '#071e0a',
    accentColor: '#4ADE80',
    label: 'VERY GOOD NEWS',
    image: '/images/slide2-forest.jpg', // 청정 자연 숲 사진
    imagePosition: 'left',
    title: '무공해 유기농 뉴스\nVery Good News',
    titleAccent: 'Very Good News',
    sub: '자연처럼 깨끗하고 맑은 뉴스를 전합니다',
    barColor: '#4ADE80',
  },
  {
    id: 2,
    bg: '#0f0e08',
    accentColor: '#f0c060',
    label: 'TODAY',
    image: '/images/slide3-dogs.jpg', // 달리는 강아지들 사진
    imagePosition: 'center',
    leftText: { title: '당신이 우울한\n뉴스들에\n지쳤다면', accent: '지쳤다면' },
    rightText: { lines: ['very', 'good', 'news'], accentLines: [0, 1], sub: '따뜻한 소식이 기다립니다' },
    barColor: '#f0c060',
  },
]

const SLIDE_DURATION = 5000

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [cur, setCur] = useState(0)
  const [prog, setProg] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goSlide = (n: number) => {
    setCur(n)
    setProg(0)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progRef.current) clearInterval(progRef.current)
    startAuto(n)
  }

  const startAuto = (current: number) => {
    let p = 0
    progRef.current = setInterval(() => {
      p += 100 / (SLIDE_DURATION / 80)
      if (p > 100) p = 100
      setProg(p)
    }, 80)
    timerRef.current = setTimeout(() => {
      const next = (current + 1) % SLIDES.length
      setCur(next)
      setProg(0)
      if (progRef.current) clearInterval(progRef.current)
      startAuto(next)
    }, SLIDE_DURATION)
  }

  useEffect(() => {
    startAuto(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progRef.current) clearInterval(progRef.current)
    }
  }, [])

  const slide = SLIDES[cur]

  return (
    <header style={{ backgroundColor: '#0B2A1A' }}>

      {/* ── 최상단 바 ── */}
      <div style={{ backgroundColor: '#071e12' }} className="px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-white tracking-tight">Very</span>
          <span className="font-serif text-lg font-bold tracking-tight" style={{ color: '#4ADE80' }}>Good</span>
          <span className="font-serif text-lg font-bold text-white tracking-tight">News</span>
          <span className="text-xs ml-2" style={{ color: '#3a6a4a' }}>세상에서 가장 따뜻한 뉴스</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs" style={{ color: '#4a7a5a' }}>
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
          <span className="w-px h-2 inline-block" style={{ backgroundColor: '#1a4a2e' }} />
          {user ? (
            <>
              <span className="text-xs" style={{ color: '#A7F3D0' }}>{user.nickname}님</span>
              <button onClick={logout} className="text-xs" style={{ color: '#5a9a6a' }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs" style={{ color: '#5a9a6a' }}>로그인</Link>
              <Link href="/signup" className="text-xs font-semibold" style={{ color: '#4ADE80' }}>시민기자 가입</Link>
            </>
          )}
        </div>
        {/* 모바일 햄버거 */}
        <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="flex flex-col gap-1">
            {[0,1,2].map(i => (
              <span key={i} className="block w-5 h-0.5" style={{ backgroundColor: '#fff' }} />
            ))}
          </div>
        </button>
      </div>

      {/* ── 배너 슬라이더 ── */}
      <div className="relative overflow-hidden" style={{ height: 120, backgroundColor: slide.bg, transition: 'background-color 1.2s ease' }}>

        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 flex items-stretch transition-opacity duration-1000"
            style={{ opacity: i === cur ? 1 : 0 }}
          >
            {/* 슬라이드 3: 3단 (왼쪽 텍스트 | 가운데 이미지 | 오른쪽 텍스트) */}
            {s.imagePosition === 'center' && s.leftText && s.rightText ? (
              <>
                {/* 왼쪽 텍스트 */}
                <div className="flex-1 flex flex-col justify-center pl-6 z-10 min-w-0">
                  <span className="block text-xs font-bold mb-2" style={{ color: s.accentColor, letterSpacing: '0.15em' }}>{s.label}</span>
                  <p className="font-serif font-bold text-white leading-relaxed text-sm whitespace-pre-line">
                    {s.leftText.title.split('\n').map((line, li) => (
                      <span key={li} style={{ color: line === s.leftText!.accent ? s.accentColor : '#fff', display: 'block' }}>{line}</span>
                    ))}
                  </p>
                </div>
                {/* 가운데 이미지 */}
                <div className="relative overflow-hidden flex-shrink-0" style={{ width: 220 }}>
                  <img src={s.image} alt="슬라이드 이미지" className="w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
                  <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to right, ${s.bg}, transparent 30%, transparent 70%, ${s.bg})` }} />
                  <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, ${s.bg} 0%, transparent 25%, transparent 75%, ${s.bg} 100%)` }} />
                </div>
                {/* 오른쪽 텍스트 */}
                <div className="flex-1 flex flex-col justify-center pr-6 z-10 text-right min-w-0">
                  <p className="font-serif font-bold leading-tight whitespace-nowrap" style={{ fontSize: 18 }}>
                    {s.rightText.lines.map((line, li) => (
                      <span key={li} style={{ color: s.rightText!.accentLines.includes(li) ? s.accentColor : '#fff', display: 'block' }}>{line}</span>
                    ))}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <span className="text-xs" style={{ color: '#a08050' }}>{s.rightText.sub}</span>
                    <div className="w-4 h-px rounded" style={{ backgroundColor: s.accentColor }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 슬라이드 1, 2: 이미지 + 텍스트 좌우 배치 */}
                {s.imagePosition === 'right' ? (
                  <>
                    {/* 왼쪽 텍스트 */}
                    <div className="flex-1 flex flex-col justify-center pl-6 z-10">
                      <span className="block text-xs font-bold mb-2" style={{ color: s.accentColor, letterSpacing: '0.2em' }}>{s.label}</span>
                      <p className="font-serif font-bold text-white leading-relaxed whitespace-pre-line" style={{ fontSize: 15 }}>
                        {s.title.split('\n').map((line, li) => (
                          <span key={li} style={{ color: line === s.titleAccent ? s.accentColor : '#fff', display: 'block' }}>{line}</span>
                        ))}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-px rounded" style={{ width: 18, backgroundColor: s.accentColor }} />
                        <span className="text-xs" style={{ color: '#6EAA8A' }}>{s.sub}</span>
                      </div>
                    </div>
                    {/* 오른쪽 이미지 */}
                    <div className="relative overflow-hidden flex-shrink-0" style={{ width: 240 }}>
                      <img src={s.image} alt="슬라이드 이미지" className="block object-cover" style={{ width: 240, height: 120, objectPosition: 'center top' }} />
                      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to right, ${s.bg} 0%, transparent 35%)` }} />
                      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, ${s.bg} 0%, transparent 25%, transparent 70%, ${s.bg} 100%)` }} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* 왼쪽 이미지 */}
                    <div className="relative overflow-hidden flex-shrink-0" style={{ width: 240 }}>
                      <img src={s.image} alt="슬라이드 이미지" className="block object-cover" style={{ width: 240, height: 120, objectPosition: 'center center' }} />
                      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to left, ${s.bg} 0%, transparent 35%)` }} />
                      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, ${s.bg} 0%, transparent 25%, transparent 70%, ${s.bg} 100%)` }} />
                    </div>
                    {/* 오른쪽 텍스트 */}
                    <div className="flex-1 flex flex-col justify-center pr-6 pl-2 z-10">
                      <span className="block text-xs font-bold mb-2" style={{ color: s.accentColor, letterSpacing: '0.2em' }}>{s.label}</span>
                      <p className="font-serif font-bold text-white leading-relaxed whitespace-pre-line" style={{ fontSize: 15 }}>
                        {s.title.split('\n').map((line, li) => (
                          <span key={li} style={{ color: line === s.titleAccent ? s.accentColor : '#fff', display: 'block' }}>{line}</span>
                        ))}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-px rounded" style={{ width: 18, backgroundColor: s.accentColor }} />
                        <span className="text-xs" style={{ color: '#6EAA8A' }}>{s.sub}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ))}

        {/* 진행바 */}
        <div className="absolute bottom-0 left-0 h-0.5 z-20 transition-all" style={{ width: `${prog}%`, backgroundColor: slide.barColor }} />

        {/* 도트 인디케이터 */}
        <div className="absolute bottom-2 right-3 flex gap-1.5 z-20">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className="transition-all duration-300"
              style={{
                width: i === cur ? 16 : 5,
                height: 5,
                borderRadius: i === cur ? 2 : '50%',
                backgroundColor: i === cur ? slide.barColor : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 네비게이션 ── */}
      <nav className="border-t" style={{ borderColor: '#1a4a2e' }}>
        <div className="max-w-7xl mx-auto px-4 hidden md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-xs font-medium relative transition-colors"
                style={{ color: isActive ? '#4ADE80' : '#6EAA8A', letterSpacing: '0.05em' }}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#4ADE80' }} />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-2" style={{ borderColor: '#1a4a2e', backgroundColor: '#0d3320' }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 text-sm border-b"
              style={{ color: '#A7F3D0', borderColor: '#1a4a2e' }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="py-2 flex gap-4">
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm" style={{ color: '#A7F3D0' }}>로그아웃</button>
            ) : (
              <>
                <Link href="/login" className="text-sm" style={{ color: '#A7F3D0' }} onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/signup" className="text-sm font-semibold" style={{ color: '#4ADE80' }} onClick={() => setMenuOpen(false)}>시민기자 가입</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
