import { NextRequest, NextResponse } from 'next/server'
import { chat, summarizeGoal } from '@/lib/gemini'

export async function POST(request: NextRequest) {
    try {
        const { messages, userMessage } = await request.json()

        if (!userMessage) {
            return NextResponse.json(
                { error: '메시지를 입력해주세요' },
                { status: 400 }
            )
        }

        console.log('[API] Calling Gemini with message:', userMessage)
        console.log('[API] Message history length:', messages?.length || 0)

        // Gemini API 호출
        const response = await chat(messages || [], userMessage)
        console.log('[API] Gemini response received, length:', response?.length || 0)

        // 응답에서 단계 태그 추출
        const stepMatch = response.match(/\[STEP:(\d)\]/)
        const isCompleted = response.includes('[COMPLETED]')

        // 태그 제거한 메시지
        const cleanResponse = response
            .replace(/\[STEP:\d\]/g, '')
            .replace(/\[COMPLETED\]/g, '')
            .trim()

        // 단계 매핑
        const stepMap: { [key: string]: string } = {
            '1': 'input',
            '2': 'problem_definition',
            '3': 'why_analysis',
            '4': 'redefinition',
            '5': 'smart_goal',
        }

        const currentStep = stepMatch ? stepMap[stepMatch[1]] || 'input' : 'input'

        // 대화 완료 시 요약 생성
        let summary = null
        if (isCompleted) {
            try {
                summary = await summarizeGoal([...messages, { role: 'user', content: userMessage }])
            } catch (e) {
                console.error('Summary Error:', e)
            }
        }

        return NextResponse.json({
            message: cleanResponse,
            step: currentStep,
            isCompleted,
            summary
        })
    } catch (error: any) {
        console.error('Chat API Detailed Error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            status: error.status,
            statusText: error.statusText
        })
        return NextResponse.json(
            { error: error.message || 'AI 응답 중 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
