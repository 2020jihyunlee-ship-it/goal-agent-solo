import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const sessionId = request.nextUrl.searchParams.get('sessionId')
    const taskDate = request.nextUrl.searchParams.get('taskDate')
    if (!sessionId || !taskDate) return NextResponse.json({ error: 'sessionId, taskDate 필요' }, { status: 400 })

    const { data, error } = await supabase
        .from('planner_weekly_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('task_date', taskDate)
        .order('order_index', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { session_id, task_date, title, order_index } = await request.json()

    // week_start 계산 (월요일 기준, NOT NULL 컬럼)
    const d = new Date(task_date)
    const day = d.getUTCDay()
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
    d.setUTCDate(diff)
    const week_start = d.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('planner_weekly_tasks')
        .insert({ session_id, task_date, week_start, title, order_index: order_index ?? 0 })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
