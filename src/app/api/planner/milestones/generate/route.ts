import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.')
    return new GoogleGenerativeAI(apiKey)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const body = await request.json()
    const { sessionId, summary, smart_time_bound, smart_specific, smart_measurable } = body

    if (!sessionId) return NextResponse.json({ error: 'sessionId가 필요합니다' }, { status: 400 })

    const today = new Date().toISOString().split('T')[0]

    const prompt = `오늘 날짜: ${today}
SMART 목표 요약: ${summary || ''}
구체적 목표(S): ${smart_specific || ''}
측정 기준(M): ${smart_measurable || ''}
기한(T): ${smart_time_bound || ''}

위 목표 달성을 위한 5~7개의 구체적 월별 마일스톤을 생성하세요.
기한 이내 날짜로 오름차순 정렬.
반드시 JSON 배열만 응답:
[{"title":"...","due_date":"YYYY-MM-DD","order_index":0}, ...]`

    try {
        const model = getGenAI().getGenerativeModel({ model: 'gemini-flash-latest' })
        const result = await model.generateContent(prompt)
        const text = result.response.text()

        const match = text.match(/\[[\s\S]*\]/)
        if (!match) throw new Error('JSON 파싱 실패')

        const milestones: { title: string; due_date: string; order_index: number }[] = JSON.parse(match[0])

        const rows = milestones.map((m, i) => ({
            session_id: sessionId,
            title: m.title,
            due_date: m.due_date || null,
            order_index: m.order_index ?? i,
        }))

        const { data, error } = await supabase
            .from('planner_milestones')
            .insert(rows)
            .select()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
        console.error('Milestone generation error:', err)
        return NextResponse.json({ error: err.message || '마일스톤 생성 실패' }, { status: 500 })
    }
}
