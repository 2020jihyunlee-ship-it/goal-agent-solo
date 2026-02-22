import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ count: 0 })
    }

    // 관리자 계정은 세션 제한 없음
    const ADMIN_EMAILS = ['2020jihyunlee@gmail.com']
    if (ADMIN_EMAILS.includes(user.email ?? '')) {
        return NextResponse.json({ count: 0, unlimited: true })
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const { count, error } = await supabase
        .from('goal_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startOfMonth)

    if (error) {
        console.error('Session count error:', error)
        return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
}
