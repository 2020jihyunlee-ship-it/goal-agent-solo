// 사용자 타입
export interface User {
    id: string
    email: string
    name?: string
    createdAt: Date
}

// 목표 설정 세션
export interface GoalSession {
    id: string
    user_id: string
    status: 'in_progress' | 'completed'
    original_goal?: string
    created_at: string
    completed_at?: string
}

// 대화 메시지
export interface Message {
    id: string
    session_id: string
    role: 'user' | 'assistant'
    content: string
    step: Step
    created_at: string
}

// 단계 타입
export type Step = 'input' | 'problem_definition' | 'why_analysis' | 'redefinition' | 'smart_goal'

// 최종 목표
export interface FinalGoal {
    id: string
    session_id: string
    original_goal: string
    root_cause: string
    smart_specific: string
    smart_measurable: string
    smart_achievable: string
    smart_relevant: string
    smart_time_bound: string
    summary: string
    created_at: string
}

// 워크플로우 노드 상태
export type NodeStatus = 'completed' | 'current' | 'pending'

// 워크플로우 노드
export interface WorkflowNode {
    id: string
    step: Step
    label: string
    icon: string
    status: NodeStatus
}

// 채팅 상태
export interface ChatState {
    messages: Message[]
    currentStep: Step
    isLoading: boolean
    sessionId: string | null
}
