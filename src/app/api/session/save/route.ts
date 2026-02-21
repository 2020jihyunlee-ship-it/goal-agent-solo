import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { summary } = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
        }

        // 1. 세션 생성 및 즉시 완료 상태로 저장
        const { data: session, error: sessionError } = await supabase
            .from('goal_sessions')
            .insert({
                user_id: user.id,
                status: 'completed',
                original_goal: summary.original_goal,
                completed_at: new Date().toISOString()
            })
            .select()
            .single()

        if (sessionError) throw sessionError

        // 2. 최종 목표 상세 데이터 저장 (역량 점수 포함)
        const scores = summary.competency_scores || {}
        const analysis = summary.analysis || { strengths: [], improvements: [], next_steps: [] }

        const { error: finalGoalError } = await supabase
            .from('final_goals')
            .insert({
                session_id: session.id,
                original_goal: summary.original_goal,
                root_cause: summary.root_cause,
                smart_specific: summary.smart_specific,
                smart_measurable: summary.smart_measurable,
                smart_achievable: summary.smart_achievable,
                smart_relevant: summary.smart_relevant,
                smart_time_bound: summary.smart_time_bound,
                summary: summary.summary,
                // 역량 점수
                score_total: scores.total || 0,
                score_problem_definition: scores.problem_definition || 0,
                score_self_awareness: scores.self_awareness || 0,
                score_specificity: scores.specificity || 0,
                score_action_planning: scores.action_planning || 0,
                // 분석 결과
                analysis: analysis
            })

        if (finalGoalError) throw finalGoalError

        return NextResponse.json({ id: session.id })
    } catch (error) {
        console.error('Save Session Error:', error)
        return NextResponse.json({ error: '데이터 저장 실패' }, { status: 500 })
    }
}
