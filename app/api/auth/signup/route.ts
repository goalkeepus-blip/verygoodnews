import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, real_name, phone } = await request.json()

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: '이메일, 비밀번호, 닉네임은 필수입니다.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: '회원가입에 실패했습니다.' }, { status: 500 })
    }

    await supabase.from('users').insert({
      auth_id: authData.user.id,
      email,
      nickname,
      real_name: real_name || null,
      phone: phone || null,
      role: 'citizen',
    })

    return NextResponse.json({
      success: true,
      message: '가입이 완료됐습니다. 이메일을 확인해 인증을 완료해주세요.',
    })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}