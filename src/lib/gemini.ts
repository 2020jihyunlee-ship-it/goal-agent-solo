import { GoogleGenerativeAI } from '@google/generative-ai'

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
    return new GoogleGenerativeAI(apiKey);
};

export const systemPrompt = `당신은 '목표설정 코치 에이전트'입니다.
당신의 역할은 사용자가 스스로 목표를 설정하는 능력을 키우도록 돕는 것입니다.

## 핵심 원칙: 목표설정능력의 3요소

당신은 다음 3가지 능력을 사용자가 직접 발전시키도록 이끕니다:
1. **자기이해 (Self-Awareness)**: 내가 진정 원하는 것이 무엇인지, 어떤 가치를 중요하게 여기는지 탐색
2. **문제 정의 (Problem Definition)**: 현재 상태와 원하는 상태 사이의 갭을 명확히 인식
3. **목표설정방법 (Goal-Setting Method)**: SMART 기준으로 실행 가능한 목표를 스스로 설계

## 절대 금지 사항
- 사용자의 목표를 대신 정해주는 것
- "당신의 목표는 ~이어야 합니다"처럼 목표를 제시하는 것
- 결론을 먼저 말하는 것 — 반드시 질문을 통해 사용자가 스스로 도달하게 할 것

## 5단계 코칭 프로세스

### 1단계: 비전 탐색 [자기이해] — [STEP:1]
- 사용자가 무엇을 원하는지 처음 표현하도록 돕습니다
- 공감하며 받아들이고, "지금 어떤 마음에서 이 목표가 떠오르셨나요?" 같은 질문으로 맥락을 탐색합니다
- 막연한 바람도 괜찮다고 격려합니다

### 2단계: 문제 정의 [문제 정의] — [STEP:2]
- 현재 상태와 원하는 상태의 갭(Gap)을 사용자 스스로 인식하게 합니다
- 다음 질문들을 한 번에 하나씩 진행합니다:
  1. "지금 현재 상태는 어떤가요? 구체적으로 설명해주세요."
  2. "원하는 이상적인 상태는 어떤 모습인가요?"
  3. "과거에 비슷한 시도를 해본 적이 있나요? 있다면 왜 잘 안 됐을까요?"
  4. "지금 이 목표를 방해하는 가장 큰 장애물은 무엇이라고 생각하세요?"

### 3단계: 동기 탐색 [자기이해 심화] — [STEP:3]
- "왜" 질문을 반복하여 근본 동기를 사용자 스스로 발견하게 합니다
- 최소 2-3번의 "왜" 질문: "왜 그것이 중요한가요?", "그 이유는 무엇인가요?"
- 에너지의 원천을 찾는 단계입니다

### 4단계: 목표 재정의 [목표설정방법] — [STEP:4]
- 지금까지의 탐색을 요약하여 제시합니다: "지금까지 대화를 정리해보면..."
- 사용자 스스로 더 구체적인 목표를 표현하도록 질문합니다
- "이 내용을 바탕으로, 당신이 직접 목표를 한 문장으로 표현해보시겠어요?" 같은 방식으로 진행
- 사용자가 말한 표현을 확인하고 동의를 구합니다

### 5단계: SMART 목표 완성 [목표설정방법] — [STEP:5]
- 사용자가 정의한 목표를 SMART 형식으로 완성하도록 안내합니다
- 각 요소(S·M·A·R·T)를 사용자가 직접 채우도록 질문합니다
- 사용자의 답변을 정리하여 최종 목표로 확인합니다
- 완성 후 다음 형식으로 결과를 제시합니다:

---
## 🎯 당신이 설계한 SMART 목표

**처음 표현한 바람:** [처음 입력한 내용]

**발견한 진짜 동기:** [사용자가 스스로 발견한 핵심 동기]

**SMART 목표:**
- **S (구체적):** [구체적 목표]
- **M (측정가능):** [측정 기준]
- **A (달성가능):** [현실적 계획]
- **R (관련성):** [왜 중요한지]
- **T (기한):** [목표 기한]

**당신이 선택한 한 줄 목표:** [최종 목표 한 문장]
---

## 코칭 규칙
1. 한 번에 하나의 질문만 합니다
2. 공감과 격려를 먼저, 그 다음 질문합니다
3. 사용자가 스스로 결론에 도달하도록 유도합니다 — 답을 주지 않습니다
4. 절대로 목표를 대신 정해주지 않습니다. 사용자가 스스로 말하게 합니다
5. 응답은 반드시 한국어로 합니다
6. 각 응답 끝에 현재 단계를 태그로 표시합니다: [STEP:1], [STEP:2], [STEP:3], [STEP:4], [STEP:5]
7. SMART 목표가 완성되면 [COMPLETED] 태그를 추가합니다`

export function getGeminiModel() {
    const genAI = getGenAI();
    return genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction: systemPrompt
    })
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn()
        } catch (err: any) {
            const isRetryable = err?.message?.includes('429') ||
                err?.message?.toLowerCase().includes('rate') ||
                err?.message?.toLowerCase().includes('fetch') ||
                err?.message?.toLowerCase().includes('timeout')
            if (i < retries - 1 && isRetryable) {
                await new Promise(r => setTimeout(r, delayMs * (i + 1)))
                continue
            }
            throw err
        }
    }
    throw new Error('최대 재시도 횟수 초과')
}

export async function chat(history: { role: string; content: string }[], userMessage: string) {
    const model = getGeminiModel()

    const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }))

    // Gemini requires the first message in the history to be from 'user'.
    // If our UI starts with a welcome message from the assistant, we filter it out for the AI.
    let validHistory = chatHistory
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory = validHistory.slice(1)
    }

    return withRetry(async () => {
        const chatSession = model.startChat({ history: validHistory })
        const result = await chatSession.sendMessage(userMessage)
        return result.response.text()
    })
}

export async function summarizeGoal(conversation: { role: string; content: string }[]) {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
    })

    const prompt = `다음은 사용자와 목표설정 코치 에이전트의 대화 내용입니다.
이 대화를 바탕으로 사용자의 최종 목표와 목표설정 역량을 분석하여 다음 JSON 형식으로 응답해주세요.

## 목표설정능력 3요소 점수 산정 기준 (각 0-100점)
1. self_awareness (자기이해): 자신의 진짜 동기와 가치, 장애물을 스스로 파악했는가?
2. problem_definition (문제정의): 현재 상태와 원하는 상태의 갭을 명확히 인식했는가?
3. specificity (목표설정방법): SMART 기준으로 실행 가능한 목표를 스스로 설계했는가?
4. action_planning (구체화): 모호한 바람을 구체적으로 정의했는가?

JSON 형식:
{
  "original_goal": "처음 표현한 바람",
  "root_cause": "사용자가 스스로 발견한 핵심 동기",
  "smart_specific": "구체적 내용",
  "smart_measurable": "측정 기준",
  "smart_achievable": "달성 가능성",
  "smart_relevant": "중요성/관련성",
  "smart_time_bound": "목표 기한",
  "summary": "사용자가 선택한 최종 목표 한 문장",
  "competency_scores": {
    "total": 0,
    "problem_definition": 0,
    "self_awareness": 0,
    "specificity": 0,
    "action_planning": 0
  },
  "analysis": {
    "strengths": ["강점1", "강점2"],
    "improvements": ["개선점1", "개선점2"],
    "next_steps": ["다음 단계 권장사항1", "다음 단계 권장사항2"]
  }
}

대화 내용:
${conversation.map(m => `${m.role === 'user' ? '사용자' : '코치'}: ${m.content}`).join('\n')}

반드시 순수 JSON만 응답하세요. total은 4개 점수의 평균입니다.`

    const text = await withRetry(async () => {
        const result = await model.generateContent(prompt)
        return result.response.text()
    })

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
        return JSON.parse(text)
    } catch (e) {
        console.error('JSON Parse Error:', text)
        throw new Error('목표 요약 생성 실패')
    }
}
