'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ChatContainer from '@/components/chat/ChatContainer'
import AgentNavigator from '@/components/navigation/AgentNavigator'
import { Message, Step } from '@/types'
import { downloadPdf } from '@/lib/pdf'
import CompetencyRadar from '@/components/visualization/CompetencyRadar'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

// React Flow는 SSR을 지원하지 않으므로 dynamic import
const WorkflowGraph = dynamic(
    () => import('@/components/workflow/WorkflowGraph'),
    { ssr: false }
)

export default function NewSessionPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [currentStep, setCurrentStep] = useState<Step>('input')
    const [completedSteps, setCompletedSteps] = useState<Step[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [finalSummary, setFinalSummary] = useState<any>(null)
    const [userName, setUserName] = useState<string>('')
    const [splitPercent, setSplitPercent] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !contentRef.current) return
            const rect = contentRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = (x / rect.width) * 100
            setSplitPercent(Math.min(Math.max(percent, 25), 75))
        }
        const handleMouseUp = () => setIsDragging(false)

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    const handleDownloadPdf = async () => {
        setIsDownloading(true)
        try {
            const dateStr = new Date().toISOString().split('T')[0]
            await downloadPdf({
                filename: `KINGCLE_G-STAR_Report_${dateStr}.pdf`,
                elementId: 'session-workspace' // Capture whole workspace instead of only chat
            })
        } finally {
            setIsDownloading(false)
        }
    }

    // 초기 세션 생성 및 환영 메시지
    useEffect(() => {
        const initSession = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const name = user?.user_metadata?.name || ''
            setUserName(name)

            const welcomeMessage: Message = {
                id: 'welcome',
                session_id: 'new',
                role: 'assistant',
                content: `안녕하세요${name ? `, ${name}님` : ''}! 🎯 목표설정 코치입니다.\n\n어떤 목표를 가슴에 품고 계신가요? 아직은 막연해도 괜찮습니다. 대화를 나누며 ${name ? `${name}님만의` : '당신만의'} 목표를 함께 발견해볼게요.`,
                step: 'input',
                created_at: new Date().toISOString(),
            }
            setMessages([welcomeMessage])
        }
        initSession()
    }, [])

    const handleSendMessage = async (content: string) => {
        // 사용자 메시지 추가
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            session_id: 'new',
            role: 'user',
            content,
            step: currentStep,
            created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            // API 호출
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages,
                    userMessage: content,
                }),
            })

            if (!response.ok) {
                throw new Error('API 요청 실패')
            }

            const data = await response.json()

            // AI 응답 추가
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                session_id: 'new',
                role: 'assistant',
                content: data.message,
                step: data.step as Step,
                created_at: new Date().toISOString(),
            }
            setMessages(prev => [...prev, aiMessage])

            // 단계 업데이트
            if (data.step !== currentStep) {
                setCompletedSteps(prev => [...prev, currentStep])
                setCurrentStep(data.step as Step)
            }

            // 완료 확인 및 요약 저장
            if (data.isCompleted && data.summary) {
                setIsCompleted(true)
                setFinalSummary(data.summary)
                setCompletedSteps(prev => [...prev, data.step as Step])

                // 최종 결과 저장 및 이동
                saveFinalResult(data.summary)
            }
        } catch (error) {
            console.error('Error:', error)
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                session_id: 'new',
                role: 'assistant',
                content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
                step: currentStep,
                created_at: new Date().toISOString(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const saveFinalResult = async (summary: any) => {
        try {
            const response = await fetch('/api/session/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary }),
            })
            const { id } = await response.json()
            if (id) {
                router.push(`/session/${id}`)
            }
        } catch (error) {
            console.error('Save Error:', error)
            alert('목표 저장 중 오류가 발생했습니다.')
        }
    }

    const getStageInfo = (step: Step) => {
        switch (step) {
            case 'input': return { name: '비전 탐색 (Vision)', desc: '목표의 씨앗을 찾는 중...' };
            case 'problem_definition': return { name: '핵심 파악 (Core)', desc: '본질적인 문제를 정의하고 있습니다.' };
            case 'why_analysis': return { name: '에너지 발견 (Energy)', desc: '목표를 향한 근본적인 동기를 분석 중...' };
            case 'redefinition': return { name: '형태 구체화 (Form)', desc: '목표가 구체적인 형체로 변하고 있습니다.' };
            case 'smart_goal': return { name: '완성 (SMART)', desc: 'G-STAR 기반의 완벽한 목표가 설계되었습니다.' };
            default: return { name: '준비 중', desc: '분석 대기 중...' };
        }
    }

    const stageInfo = getStageInfo(currentStep);

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    ← 홈
                </Link>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>
                        <span className="text-gradient">KINGCLE</span> <span style={{ color: '#7df9ff', fontStyle: 'italic', fontWeight: 800 }}>AI</span> COACH
                    </h1>
                </div>
                <div className={styles.headerActions}>
                    {userName && (
                        <div className={styles.userBadge}>
                            <span className={styles.userAvatar}>{userName.charAt(0)}</span>
                            <span className={styles.userName}>{userName}님</span>
                        </div>
                    )}
                    <button
                        className={styles.pdfButton}
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? '📄 처리 중...' : '📄 PDF 리포트'}
                    </button>
                    {isCompleted && (
                        <span className={styles.completedBadge}>✓ 설계 완료</span>
                    )}
                    <button
                        className={styles.logoutButton}
                        onClick={async () => {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            router.push('/')
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            <AgentNavigator currentStep="goal" />

            <div
                className={`${styles.content} ${isDragging ? styles.dragging : ''}`}
                ref={contentRef}
            >
                {/* LEFT: Communication (Chat) */}
                <section
                    className={styles.chatSection}
                    style={{ width: `${splitPercent}%` }}
                >
                    <ChatContainer
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </section>

                {/* RESIZER */}
                <div
                    className={`${styles.resizer} ${isDragging ? styles.resizerActive : ''}`}
                    onMouseDown={handleResizerMouseDown}
                >
                    <div className={styles.resizerHandle} />
                </div>

                {/* RIGHT: Visualisation (Canvas) */}
                <aside
                    className={styles.sidebar}
                    style={{ width: `${100 - splitPercent}%` }}
                >
                    <div className={styles.canvasHeader}>
                        <div className={styles.canvasTitle}>Strategic Evolution Canvas</div>
                        <div className={styles.canvasStatus}>LIVE ANALYSIS ENABLED</div>
                    </div>

                    <div className={styles.visualizationArea}>
                        <WorkflowGraph
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                        />

                        {/* Strategic Insight Card */}
                        <div className={styles.insightCard}>
                            <div className={styles.insightHeader}>
                                <span className={styles.insightDot}></span>
                                CURRENT STRATEGIC PHASE
                            </div>
                            <div className={styles.insightContent}>
                                {isCompleted ? (
                                    <div className={styles.finalHighlight}>
                                        <div className={styles.highlightTitle}>SMART GOAL ARCHITECTED</div>
                                        <div className={styles.highlightText}>"{finalSummary?.summary || '목표 설정이 성공적으로 완료되었습니다.'}"</div>
                                    </div>
                                ) : (
                                    <div className={styles.phaseInfo}>
                                        <h3>{stepConfig.find(s => s.id === currentStep)?.label || '준비 중'} 단계 진행 중</h3>
                                        <p>당신의 목표를 정교하게 깎아나가는 중입니다. 대화를 이어가면 분석 결과가 이 캔버스에 실시간으로 기록됩니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main >
    )
}

const stepConfig: { id: Step; label: string; icon: string }[] = [
    { id: 'input', label: 'Vision', icon: '🎯' },
    { id: 'problem_definition', label: 'Core', icon: '🔍' },
    { id: 'why_analysis', label: 'Energy', icon: '🔥' },
    { id: 'redefinition', label: 'Form', icon: '🔄' },
    { id: 'smart_goal', label: 'SMART', icon: '⭐' },
]
