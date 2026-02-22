import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ error: 'sessionId가 필요합니다' }, { status: 400 })

    const { data, error } = await supabase
        .from('planner_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const body = await request.json()
    const { session_id, content, log_date } = body

    const { data, error } = await supabase
        .from('planner_logs')
        .insert({ session_id, content, log_date: log_date || new Date().toISOString().split('T')[0] })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
