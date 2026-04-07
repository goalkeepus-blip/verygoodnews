import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ error: '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.' }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, nickname, role, profile_image')
      .eq('auth_id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: { id: profile?.id, email: data.user.email, nickname: profile?.nickname, role: profile?.role },
    })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}