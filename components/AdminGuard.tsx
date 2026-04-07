'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <div className="text-forest-muted text-sm">확인 중...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return <>{children}</>
}