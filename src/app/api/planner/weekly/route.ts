import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const sessionId = request.nextUrl.searchParams.get('sessionId')
    const weekStart = request.nextUrl.searchParams.get('weekStart')
    if (!sessionId || !weekStart) return NextResponse.json({ error: 'sessionId, weekStart 필요' }, { status: 400 })

    const { data, error } = await supabase
        .from('planner_weekly_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('week_start', weekStart)
        .order('order_index', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { session_id, week_start, title, order_index } = await request.json()

    const { data, error } = await supabase
        .from('planner_weekly_tasks')
        .insert({ session_id, week_start, title, order_index: order_index ?? 0 })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
