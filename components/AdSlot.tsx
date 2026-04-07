// components/AdSlot.tsx
// 광고 슬롯 컴포넌트 — 직접수주 → AdSense → none (display:none) 폴백

import Script from 'next/script'

interface Ad {
  id: string
  slot_key: string
  ad_type: 'direct' | 'adsense' | 'none'
  image_url: string | null
  link_url: string | null
  adsense_slot_id: string | null
}

interface AdSlotProps {
  ad: Ad | null
  fallbackClassName?: string
}

export default function AdSlot({ ad, fallbackClassName = '' }: AdSlotProps) {
  // ① 광고 데이터 없음 → 슬롯 숨김
  if (!ad || ad.ad_type === 'none') {
    return null
  }

  // ② 직접 수주 광고 (이미지 배너)
  if (ad.ad_type === 'direct' && ad.image_url) {
    return (
      <a
        href={ad.link_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full overflow-hidden rounded-xl border border-forest-border ${fallbackClassName}`}
        aria-label="광고"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt="광고"
          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
        />
      </a>
    )
  }

  // ③ AdSense 자동 광고
  if (ad.ad_type === 'adsense' && ad.adsense_slot_id) {
    return (
      <div className={`w-full ${fallbackClassName}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? ''}
          data-ad-slot={ad.adsense_slot_id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script id={`adsense-init-${ad.id}`} strategy="lazyOnload">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    )
  }

  // ④ 폴백: 플레이스홀더 (개발 환경 시각화 용도)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`w-full rounded-xl border-2 border-dashed border-forest-border bg-white flex items-center justify-center ${fallbackClassName}`}
      >
        <span className="text-xs text-forest-muted">광고 슬롯 ({ad.slot_key})</span>
      </div>
    )
  }

  return null
}
