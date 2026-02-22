import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    if (body.is_completed !== undefined) updateData.is_completed = body.is_completed
    if (body.title !== undefined) updateData.title = body.title

    const { data, error } = await supabase
        .from('planner_weekly_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { error } = await supabase
        .from('planner_weekly_tasks')
        .delete()
        .eq('id', taskId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
