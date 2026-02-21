import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    }

    // 중복 신청은 무시 (UNIQUE 제약으로 처리)
    await supabase.from('waitlist').upsert({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
    }, { onConflict: 'user_id' })

    return NextResponse.json({ ok: true })
}
