import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ error: 'sessionId가 필요합니다' }, { status: 400 })

    const { data, error } = await supabase
        .from('planner_milestones')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const body = await request.json()
    const { session_id, title, due_date, order_index } = body

    const { data, error } = await supabase
        .from('planner_milestones')
        .insert({ session_id, title, due_date: due_date || null, order_index: order_index ?? 0 })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
