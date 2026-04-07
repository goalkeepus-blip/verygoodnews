'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    real_name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
          real_name: form.real_name,
          phone: form.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess(true)
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 가입 완료 화면
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: '#E1F5EE' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0B2A1A' }}>
            가입 신청 완료!
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            <strong>{form.email}</strong>로 인증 메일을 보냈습니다.<br />
            메일함을 확인해 인증을 완료해주세요.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full py-3 rounded-lg text-white font-medium text-sm"
            style={{ backgroundColor: '#0B2A1A' }}
          >
            로그인 하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12"
         style={{ backgroundColor: '#E1F5EE' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#0B2A1A' }}>
            VeryGoodNews
          </h1>
          <p className="text-gray-500 text-sm mt-1">시민기자 가입</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="nickname" value={form.nickname}
              onChange={handleChange} required
              placeholder="사용할 닉네임"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required
              placeholder="8자 이상"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              type="password" name="passwordConfirm" value={form.passwordConfirm}
              onChange={handleChange} required
              placeholder="비밀번호 재입력"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              실명 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <input
              type="text" name="real_name" value={form.real_name}
              onChange={handleChange}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium text-sm disabled:opacity-60 mt-2"
            style={{ backgroundColor: '#0B2A1A' }}
          >
            {loading ? '처리 중...' : '시민기자 가입하기'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium hover:underline"
                style={{ color: '#0B2A1A' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}