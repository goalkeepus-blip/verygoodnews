// components/Footer.tsx
// VeryGoodNews 푸터

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white mt-16">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* 로고 & 소개 */}
          <div>
            <p className="font-serif text-xl font-bold mb-2">
              Very<span className="text-forest-accent">Good</span>News
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              세상에서 가장 무해하고 따뜻한 뉴스 플랫폼.<br />
              소소한 행복을 전달합니다.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://youtube.com/@verygoodnews"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-forest-accent transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://tiktok.com/@verygoodnews"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-forest-accent transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* 섹션 링크 */}
          <div>
            <p className="text-xs font-bold tracking-widest text-forest-accent uppercase mb-3">
              섹션
            </p>
            <ul className="space-y-2">
              {[
                { label: '국내뉴스', href: '/domestic' },
                { label: '해외뉴스', href: '/world' },
                { label: '영상뉴스', href: '/video' },
                { label: '기획·칼럼', href: '/column' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 뉴스레터 & 칼럼 투고 */}
          <div>
            <p className="text-xs font-bold tracking-widest text-forest-accent uppercase mb-3">
              참여
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  시민기자 가입
                </Link>
              </li>
              <li>
                <a
                  href="mailto:column@verygoodnews.co.kr"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  칼럼 투고 (이메일)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © 2026 VeryGoodNews. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            www.verygoodnews.co.kr
          </p>
        </div>
      </div>
    </footer>
  )
}
