import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { milestoneId: string } }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const body = await request.json()
    const { is_completed, title, due_date } = body

    const updateData: Record<string, unknown> = {}
    if (is_completed !== undefined) updateData.is_completed = is_completed
    if (title !== undefined) updateData.title = title
    if (due_date !== undefined) updateData.due_date = due_date

    const { data, error } = await supabase
        .from('planner_milestones')
        .update(updateData)
        .eq('id', params.milestoneId)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { milestoneId: string } }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { error } = await supabase
        .from('planner_milestones')
        .delete()
        .eq('id', params.milestoneId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
