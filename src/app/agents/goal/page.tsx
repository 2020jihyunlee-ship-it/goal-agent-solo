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
    const [userEmail, setUserEmail] = useState<string>('')
    const [isLimitReached, setIsLimitReached] = useState(false)
    const [sessionCount, setSessionCount] = useState<number>(0)
    const [isUnlimited, setIsUnlimited] = useState(false)
    const [waitlistDone, setWaitlistDone] = useState(false)
    const [waitlistLoading, setWaitlistLoading] = useState(false)
    const [splitPercent, setSplitPercent] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // 관리자 데모 모달
    const [showAdminModal, setShowAdminModal] = useState(false)
    const [adminPw, setAdminPw] = useState('')
    const [adminError, setAdminError] = useState('')
    const [adminUnlocked, setAdminUnlocked] = useState(false)

    const handleAdminAccess = () => {
        if (adminPw === 'kingcl1234') {
            setAdminUnlocked(true)
        } else {
            setAdminError('비밀번호가 올바르지 않습니다')
        }
    }

    const closeAdminModal = () => {
        setShowAdminModal(false)
        setAdminPw('')
        setAdminError('')
        setAdminUnlocked(false)
    }

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
        if (!finalSummary) {
            alert('목표 설정을 완료한 후 PDF를 다운로드할 수 있습니다.')
            return
        }
        setIsDownloading(true)
        try {
            const dateStr = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')
            await downloadPdf({
                filename: `KINGCLE_목표설정_리포트_${dateStr}.pdf`,
                elementId: 'pdf-report'
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
            const email = user?.email || ''
            setUserName(name)
            setUserEmail(email)

            // 이번 달 완료 세션 수 확인 (서버 API 통해 RLS 우회)
            const res = await fetch('/api/session/count')
            const { count, unlimited } = await res.json()
            setSessionCount(count)
            if (unlimited) setIsUnlimited(true)

            if (!unlimited && count >= 3) {
                setIsLimitReached(true)
                return
            }

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
                router.push(`/planner/${id}`)
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

    const handleWaitlist = async () => {
        setWaitlistLoading(true)
        try {
            await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            setWaitlistDone(true)
        } finally {
            setWaitlistLoading(false)
        }
    }

    if (isLimitReached) {
        return (
            <main className={styles.main}>
                <header className={styles.header}>
                    <Link href="/" className={styles.backButton}>← 홈</Link>
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
                        <a href="/api/auth/signout" className={styles.logoutButton}>로그아웃</a>
                    </div>
                </header>
                <div className={styles.limitGate}>
                    <div className={styles.limitCard}>
                        <div className={styles.limitIcon}>🔒</div>
                        <h2 className={styles.limitTitle}>이번 달 무료 이용 횟수를 모두 사용했습니다</h2>
                        <p className={styles.limitDesc}>
                            무료 플랜은 매달 <strong>3회</strong> 목표 코칭을 제공합니다.<br />
                            다음 달 1일에 횟수가 초기화됩니다.
                        </p>
                        <div className={styles.limitDivider} />
                        <p className={styles.limitPremiumDesc}>
                            <strong>프리미엄 플랜</strong>이 곧 출시됩니다.<br />
                            무제한 코칭 · 히스토리 보기 · PDF 리포트
                        </p>
                        {waitlistDone ? (
                            <div className={styles.waitlistSuccess}>
                                ✅ 출시 알림 신청 완료!<br />
                                <span>{userEmail} 로 안내해드릴게요.</span>
                            </div>
                        ) : (
                            <button
                                className={styles.waitlistButton}
                                onClick={handleWaitlist}
                                disabled={waitlistLoading}
                            >
                                {waitlistLoading ? '신청 중...' : '🔔 프리미엄 출시 알림 신청하기'}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.main} id="session-workspace">
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
                    <div className={styles.sessionQuota}>
                        {isUnlimited ? (
                            <span className={styles.quotaText} style={{ color: 'var(--color-primary-light)' }}>
                                ∞ 무제한
                            </span>
                        ) : (
                            <>
                                <span className={styles.quotaDots}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className={i < sessionCount ? styles.quotaDotUsed : styles.quotaDotFree} />
                                    ))}
                                </span>
                                <span className={styles.quotaText}>
                                    이번 달 {Math.max(0, 3 - sessionCount)}회 남음
                                </span>
                            </>
                        )}
                    </div>
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
                    <a
                        href="/api/auth/signout"
                        className={styles.logoutButton}
                    >
                        로그아웃
                    </a>
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
            {/* ===== 숨겨진 PDF 리포트 템플릿 (프리미엄) ===== */}
            {finalSummary && (
                <div
                    id="pdf-report"
                    style={{
                        position: 'fixed',
                        left: '-9999px',
                        top: 0,
                        width: '794px',
                        background: '#ffffff',
                        color: '#1a1a2e',
                        fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        border: '3px solid transparent',
                        backgroundClip: 'padding-box',
                    }}
                >
                    {/* ── 최상단 컬러 라인 ── */}
                    <div style={{ height: '5px', background: 'linear-gradient(90deg, #6d28d9, #3b82f6, #06b6d4)' }} />

                    {/* ── 헤더 ── */}
                    <div style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1557 50%, #1e3a5f 100%)', padding: '28px 48px 24px', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '9px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontWeight: 600 }}>KINGCLE EXPANSION OS · GOAL AGENT</div>
                                    <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '0.5px', marginBottom: '4px' }}>목표설정 리포트</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '1px' }}>G-STAR ENGINE · AI Goal Coaching</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{userName || '사용자'}님</div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
                                        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                        </div>
                    </div>

                    <div style={{ padding: '32px 48px' }}>

                        {/* ── 핵심 목표 카드 ── */}
                        <div style={{ marginBottom: '28px', position: 'relative' }}>
                            <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #faf5ff, #eff6ff)', border: '1.5px solid rgba(109,40,217,0.3)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #6d28d9, #3b82f6)', borderRadius: '12px 0 0 12px' }} />
                                <div style={{ paddingLeft: '8px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#6d28d9', letterSpacing: '2px', marginBottom: '10px' }}>나의 SMART 목표</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.5, marginBottom: '14px' }}>
                                        {finalSummary.summary}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(109,40,217,0.12)' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(109,40,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span style={{ fontSize: '10px' }}>💬</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                            처음 표현한 바람: "{finalSummary.original_goal}"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── SMART 세부 내용 ── */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.3px' }}>SMART 목표 세부 내용</div>
                            </div>
                            <div style={{ border: '1px solid #e8e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                {[
                                    { key: 'S', label: '구체적 (Specific)', value: finalSummary.smart_specific, bg: '#f5f3ff', color: '#6d28d9', border: '#ede9fe' },
                                    { key: 'M', label: '측정가능 (Measurable)', value: finalSummary.smart_measurable, bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
                                    { key: 'A', label: '달성가능 (Achievable)', value: finalSummary.smart_achievable, bg: '#ecfeff', color: '#0891b2', border: '#cffafe' },
                                    { key: 'R', label: '관련성 (Relevant)', value: finalSummary.smart_relevant, bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7' },
                                    { key: 'T', label: '기한 (Time-bound)', value: finalSummary.smart_time_bound, bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
                                ].map((item, idx) => (
                                    <div key={item.key} style={{ display: 'flex', alignItems: 'stretch', borderBottom: idx < 4 ? '1px solid #f0f0f5' : 'none' }}>
                                        <div style={{ width: '48px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: `1px solid ${item.border}` }}>
                                            <div style={{ width: '26px', height: '26px', background: item.color, color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{item.key}</div>
                                        </div>
                                        <div style={{ flex: 1, padding: '10px 16px' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 700, color: item.color, letterSpacing: '1px', marginBottom: '3px' }}>{item.label}</div>
                                            <div style={{ fontSize: '12px', color: '#333', lineHeight: 1.55 }}>{item.value || '-'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── 동기 분석 ── */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>동기 분석 — 나를 움직이는 힘</div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, border: '1.5px solid #ede9fe', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 16px', background: '#6d28d9' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>내적 동기 (Intrinsic)</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>자아실현 · 성장 · 가치 · 의미</div>
                                    </div>
                                    <div style={{ padding: '14px 16px', background: '#faf5ff' }}>
                                        <div style={{ fontSize: '12px', color: '#3b1f6b', lineHeight: 1.75 }}>
                                            {finalSummary.intrinsic_motivation || finalSummary.root_cause || '-'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, border: '1.5px solid #dbeafe', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 16px', background: '#2563eb' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>외적 동기 (Extrinsic)</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>인정 · 결과 · 보상 · 기여</div>
                                    </div>
                                    <div style={{ padding: '14px 16px', background: '#eff6ff' }}>
                                        <div style={{ fontSize: '12px', color: '#1e3a6b', lineHeight: 1.75 }}>
                                            {finalSummary.extrinsic_motivation || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 역량 점수 ── */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>목표설정 역량 점수</div>
                            </div>
                            <div style={{ padding: '20px 24px', border: '1px solid #e8e8f0', borderRadius: '10px', background: '#fafafa' }}>
                                {[
                                    { label: '자기이해 (Self-Awareness)', score: finalSummary.competency_scores?.self_awareness || 0, color: '#6d28d9' },
                                    { label: '문제 정의 (Problem Definition)', score: finalSummary.competency_scores?.problem_definition || 0, color: '#2563eb' },
                                    { label: '목표설정방법 (Specificity)', score: finalSummary.competency_scores?.specificity || 0, color: '#0891b2' },
                                    { label: '구체화 (Action Planning)', score: finalSummary.competency_scores?.action_planning || 0, color: '#059669' },
                                ].map(item => (
                                    <div key={item.label} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '160px', flexShrink: 0, fontSize: '11px', color: '#444', fontWeight: 500 }}>{item.label}</div>
                                        <div style={{ flex: 1, height: '10px', background: '#e8e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${item.score}%`, background: item.color, borderRadius: '5px', transition: 'width 0.3s' }} />
                                        </div>
                                        <div style={{ width: '36px', flexShrink: 0, textAlign: 'right', fontSize: '12px', fontWeight: 700, color: item.color }}>{item.score}</div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1.5px solid #e0e0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>종합 역량 점수</div>
                                        <div style={{ fontSize: '10px', color: '#999' }}>100점 만점 · AI 분석 기반</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 900, color: '#6d28d9', lineHeight: 1 }}>{finalSummary.competency_scores?.total || 0}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>/ 100</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 분석 결과 ── */}
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>분석 결과</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[
                                    { title: '강점', emoji: '✅', items: finalSummary.analysis?.strengths || [], bg: '#f0fdf4', header: '#16a34a', border: '#bbf7d0', textColor: '#14532d' },
                                    { title: '개선점', emoji: '🔍', items: finalSummary.analysis?.improvements || [], bg: '#fff7ed', header: '#ea580c', border: '#fed7aa', textColor: '#7c2d12' },
                                    { title: '다음 단계', emoji: '🚀', items: finalSummary.analysis?.next_steps || [], bg: '#eff6ff', header: '#2563eb', border: '#bfdbfe', textColor: '#1e3a5f' },
                                ].map(col => (
                                    <div key={col.title} style={{ flex: 1, border: `1.5px solid ${col.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ padding: '10px 14px', background: col.header }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{col.emoji} {col.title}</div>
                                        </div>
                                        <div style={{ padding: '12px 14px', background: col.bg, minHeight: '80px' }}>
                                            {col.items.map((s: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'flex-start' }}>
                                                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: col.header, flexShrink: 0, marginTop: '5px' }} />
                                                    <div style={{ fontSize: '11px', color: col.textColor, lineHeight: 1.55 }}>{s}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── 코칭 멘트 ── */}
                        <div style={{ marginBottom: '4px', padding: '24px 28px', background: 'linear-gradient(135deg, #1e0a3c, #1e3a5f)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '60px', color: 'rgba(255,255,255,0.06)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>"</div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(167,139,250,1)', letterSpacing: '2px', marginBottom: '12px' }}>💪 코칭 멘트 — 끝까지 달성하는 법</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.88)', lineHeight: 2, fontStyle: 'italic' }}>
                                    {finalSummary.coaching_message || '지금 이 순간 발견한 진짜 동기를 기억하세요. 당신은 이 목표를 달성할 충분한 이유와 능력을 갖고 있습니다. 작은 실행이 쌓여 큰 변화가 됩니다.'}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── 하단 컬러 라인 + 푸터 ── */}
                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #6d28d9, #3b82f6, #06b6d4)' }} />
                    <div style={{ padding: '14px 48px', background: '#f9f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.5px' }}>© 2026 Kingcle Expansion OS · All Rights Reserved</div>
                        <div style={{ fontSize: '10px', color: '#aaa' }}>Powered by G-STAR ENGINE · Gemini AI</div>
                    </div>
                </div>
            )}

            {/* 관리자 데모 버튼 (하단 좌측, 반투명) */}
            <button
                className={styles.adminButton}
                onClick={() => setShowAdminModal(true)}
            >
                관리자 데모
            </button>

            {/* 관리자 비번 모달 */}
            {showAdminModal && (
                <div className={styles.adminOverlay} onClick={closeAdminModal}>
                    <div className={styles.adminModal} onClick={e => e.stopPropagation()}>
                        {!adminUnlocked ? (
                            <>
                                <h3 className={styles.adminTitle}>관리자 데모</h3>
                                <p className={styles.adminDesc}>관리자 비밀번호를 입력하세요</p>
                                <input
                                    type="password"
                                    className="input"
                                    value={adminPw}
                                    onChange={e => { setAdminPw(e.target.value); setAdminError('') }}
                                    onKeyDown={e => e.key === 'Enter' && handleAdminAccess()}
                                    placeholder="비밀번호"
                                    autoFocus
                                />
                                {adminError && <p className={styles.adminError}>{adminError}</p>}
                                <div className={styles.adminActions}>
                                    <button className={styles.adminCancel} onClick={closeAdminModal}>취소</button>
                                    <button className={styles.adminConfirm} onClick={handleAdminAccess}>확인</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>✅</div>
                                    <h3 className={styles.adminTitle} style={{ marginBottom: '4px' }}>관리자 데모</h3>
                                    <p className={styles.adminDesc}>둘 중 선택하세요</p>
                                </div>
                                <button
                                    onClick={() => { window.location.href = '/planner/a1b2c3d4-0000-0000-0000-000000000001' }}
                                    style={{
                                        width: '100%', padding: '16px 18px',
                                        fontSize: '14px', fontWeight: 600, color: '#fff',
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.12))',
                                        border: '1px solid rgba(139,92,246,0.4)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>📋</span>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>꿈 실현 플래너</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>마일스톤 · 주간목표 · 실행로그</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { window.location.href = '/pdf-preview' }}
                                    style={{
                                        width: '100%', padding: '16px 18px',
                                        fontSize: '14px', fontWeight: 600, color: '#fff',
                                        background: 'linear-gradient(135deg, rgba(109,40,217,0.2), rgba(30,58,95,0.2))',
                                        border: '1px solid rgba(109,40,217,0.4)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>📄</span>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>프리미엄 PDF 리포트</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>목표설정 분석 · 동기 · 코칭 멘트</div>
                                    </div>
                                </button>
                                <button className={styles.adminCancel} onClick={closeAdminModal} style={{ width: '100%', textAlign: 'center' }}>닫기</button>
                            </>
                        )}
                    </div>
                </div>
            )}
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
