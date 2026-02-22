'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { downloadPdf } from '@/lib/pdf'
import styles from './page.module.css'

interface Milestone {
    id: string
    session_id: string
    title: string
    due_date: string | null
    is_completed: boolean
    order_index: number
    created_at: string
}

interface Log {
    id: string
    session_id: string
    content: string
    log_date: string
    created_at: string
}

interface DailyTask {
    id: string
    session_id: string
    task_date: string
    title: string
    is_completed: boolean
    order_index: number
    start_time: string | null
    end_time: string | null
    created_at: string
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2)
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
})

interface WeeklyGoal {
    id: string
    session_id: string
    week_start: string
    goal_text: string
    created_at: string
}

interface Goal {
    summary: string
    smart_specific: string
    smart_measurable: string
    smart_achievable: string
    smart_relevant: string
    smart_time_bound: string
    original_goal: string
    root_cause: string
    created_at: string
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekStart(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return toDateStr(d)
}

function formatWeekLabel(weekStart: string): string {
    const d = new Date(weekStart + 'T00:00:00')
    const month = d.getMonth() + 1
    const weekNum = Math.ceil(d.getDate() / 7)
    return `${d.getFullYear()}년 ${month}월 ${weekNum}주차`
}

function formatDayLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

function calcDDay(timeBound: string): string {
    const match = timeBound.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/)
    if (!match) return ''
    const due = new Date(match[0].replace(/[/.]/g, '-'))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (diff === 0) return 'D-DAY'
    if (diff > 0) return `D-${diff}`
    return `D+${Math.abs(diff)}`
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function isDueDateOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false
    const due = new Date(dateStr)
    due.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
}

function offsetDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + days)
    return toDateStr(d)
}

export default function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: sessionId } = use(params)
    const router = useRouter()

    const [goal, setGoal] = useState<Goal | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [generatingMilestones, setGeneratingMilestones] = useState(false)

    const [isSmartExpanded, setIsSmartExpanded] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Milestone form
    const [showAddMilestone, setShowAddMilestone] = useState(false)
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
    const [newMilestoneDue, setNewMilestoneDue] = useState('')
    const [addingMilestone, setAddingMilestone] = useState(false)

    // Log form
    const [showAddLog, setShowAddLog] = useState(false)
    const [newLogContent, setNewLogContent] = useState('')
    const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0])
    const [addingLog, setAddingLog] = useState(false)

    // 3번: 주간 목표
    const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null)
    const [goalText, setGoalText] = useState('')
    const [isEditingGoal, setIsEditingGoal] = useState(false)
    const [savingGoal, setSavingGoal] = useState(false)

    // 4번: 일일 일정 (날짜별)
    const todayStr = new Date().toISOString().split('T')[0]
    const [selectedDate, setSelectedDate] = useState(todayStr)
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
    const [showAddDaily, setShowAddDaily] = useState(false)
    const [newDailyTitle, setNewDailyTitle] = useState('')
    const [newStartTime, setNewStartTime] = useState('')
    const [newEndTime, setNewEndTime] = useState('')
    const [addingDaily, setAddingDaily] = useState(false)

    const completedCount = milestones.filter(m => m.is_completed).length
    const totalCount = milestones.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const currentWeekStart = getWeekStart(selectedDate)

    // 초기 데이터 로드
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const [goalRes, msRes, logRes] = await Promise.all([
                supabase.from('final_goals').select('*').eq('session_id', sessionId).single(),
                fetch(`/api/planner/milestones?sessionId=${sessionId}`),
                fetch(`/api/planner/logs?sessionId=${sessionId}`),
            ])

            const goalData = goalRes.data
            const msData: Milestone[] = msRes.ok ? await msRes.json() : []
            const logData: Log[] = logRes.ok ? await logRes.json() : []

            setGoal(goalData)
            setLogs(logData)
            setLoading(false)

            if (msData.length === 0 && goalData) {
                setGeneratingMilestones(true)
                try {
                    const genRes = await fetch('/api/planner/milestones/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId,
                            summary: goalData.summary,
                            smart_time_bound: goalData.smart_time_bound,
                            smart_specific: goalData.smart_specific,
                            smart_measurable: goalData.smart_measurable,
                        }),
                    })
                    if (genRes.ok) {
                        const generated = await genRes.json()
                        setMilestones(generated)
                    }
                } finally {
                    setGeneratingMilestones(false)
                }
            } else {
                setMilestones(msData)
            }
        }
        init()
    }, [sessionId, router])

    // 주간 목표 로드 (날짜 변경 시 주차 바뀌면 리로드)
    useEffect(() => {
        if (!sessionId) return
        fetch(`/api/planner/weekly-goals?sessionId=${sessionId}&weekStart=${currentWeekStart}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                setWeeklyGoal(data)
                setGoalText(data?.goal_text ?? '')
                setIsEditingGoal(false)
            })
    }, [sessionId, currentWeekStart])

    // 일일 일정 로드 (날짜 변경 시)
    useEffect(() => {
        if (!sessionId) return
        fetch(`/api/planner/weekly?sessionId=${sessionId}&taskDate=${selectedDate}`)
            .then(r => r.ok ? r.json() : [])
            .then(setDailyTasks)
    }, [sessionId, selectedDate])

    const handleSaveGoal = async () => {
        if (!goalText.trim()) return
        setSavingGoal(true)
        const res = await fetch('/api/planner/weekly-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                week_start: currentWeekStart,
                goal_text: goalText.trim(),
            }),
        })
        if (res.ok) {
            const saved = await res.json()
            setWeeklyGoal(saved)
            setIsEditingGoal(false)
        }
        setSavingGoal(false)
    }

    const handleToggleDaily = useCallback(async (task: DailyTask) => {
        const newVal = !task.is_completed
        setDailyTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: newVal } : t))
        await fetch(`/api/planner/weekly/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: newVal }),
        })
    }, [])

    const handleDeleteDaily = useCallback(async (id: string) => {
        setDailyTasks(prev => prev.filter(t => t.id !== id))
        await fetch(`/api/planner/weekly/${id}`, { method: 'DELETE' })
    }, [])

    const handleAddDaily = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDailyTitle.trim()) return
        setAddingDaily(true)
        const res = await fetch('/api/planner/weekly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                task_date: selectedDate,
                title: newDailyTitle.trim(),
                order_index: dailyTasks.length,
                start_time: newStartTime || null,
                end_time: newEndTime || null,
            }),
        })
        if (res.ok) {
            const created = await res.json()
            setDailyTasks(prev => {
                const next = [...prev, created]
                return next.sort((a, b) => {
                    if (!a.start_time && !b.start_time) return 0
                    if (!a.start_time) return 1
                    if (!b.start_time) return -1
                    return a.start_time.localeCompare(b.start_time)
                })
            })
            setNewDailyTitle('')
            setNewStartTime('')
            setNewEndTime('')
            setShowAddDaily(false)
        }
        setAddingDaily(false)
    }

    const handleToggleMilestone = useCallback(async (ms: Milestone) => {
        const newVal = !ms.is_completed
        setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, is_completed: newVal } : m))
        await fetch(`/api/planner/milestones/${ms.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: newVal }),
        })
    }, [])

    const handleDeleteMilestone = useCallback(async (id: string) => {
        setMilestones(prev => prev.filter(m => m.id !== id))
        await fetch(`/api/planner/milestones/${id}`, { method: 'DELETE' })
    }, [])

    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const handleDragStart = useCallback((idx: number) => setDragIndex(idx), [])

    const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
        e.preventDefault()
        setDragOverIndex(idx)
    }, [])

    const handleDrop = useCallback(async (dropIdx: number) => {
        if (dragIndex === null || dragIndex === dropIdx) {
            setDragIndex(null)
            setDragOverIndex(null)
            return
        }
        setMilestones(prev => {
            const next = [...prev]
            const [moved] = next.splice(dragIndex, 1)
            next.splice(dropIdx, 0, moved)
            const updated = next.map((m, i) => ({ ...m, order_index: i }))
            updated.forEach(m => fetch(`/api/planner/milestones/${m.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_index: m.order_index }),
            }))
            return updated
        })
        setDragIndex(null)
        setDragOverIndex(null)
    }, [dragIndex])

    const handleDragEnd = useCallback(() => {
        setDragIndex(null)
        setDragOverIndex(null)
    }, [])

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMilestoneTitle.trim()) return
        setAddingMilestone(true)
        const res = await fetch('/api/planner/milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                title: newMilestoneTitle.trim(),
                due_date: newMilestoneDue || null,
                order_index: milestones.length,
            }),
        })
        if (res.ok) {
            const created = await res.json()
            setMilestones(prev => [...prev, created])
            setNewMilestoneTitle('')
            setNewMilestoneDue('')
            setShowAddMilestone(false)
        }
        setAddingMilestone(false)
    }

    const handleDeleteLog = useCallback(async (id: string) => {
        setLogs(prev => prev.filter(l => l.id !== id))
        await fetch(`/api/planner/logs/${id}`, { method: 'DELETE' })
    }, [])

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newLogContent.trim()) return
        setAddingLog(true)
        const res = await fetch('/api/planner/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                content: newLogContent.trim(),
                log_date: newLogDate,
            }),
        })
        if (res.ok) {
            const created = await res.json()
            setLogs(prev => [created, ...prev])
            setNewLogContent('')
            setNewLogDate(new Date().toISOString().split('T')[0])
            setShowAddLog(false)
        }
        setAddingLog(false)
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleDownloadPdf = async () => {
        setIsDownloading(true)
        try {
            await downloadPdf({
                filename: `planner_${sessionId.slice(0, 8)}.pdf`,
                elementId: 'planner-content',
            })
        } finally {
            setIsDownloading(false)
        }
    }

    if (loading) {
        return (
            <main className={styles.main}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>플래너를 불러오는 중...</p>
                </div>
            </main>
        )
    }

    if (!goal) {
        return (
            <main className={styles.main}>
                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}>목표를 찾을 수 없습니다.</p>
                    <Link href="/agents/goal" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        새 목표 설정하기
                    </Link>
                </div>
            </main>
        )
    }

    const dDay = calcDDay(goal.smart_time_bound)
    const dDayClass = dDay === 'D-DAY' ? styles.today : dDay.startsWith('D+') ? styles.overdue : ''
    const dailyCompleted = dailyTasks.filter(t => t.is_completed).length
    const dailyPercent = dailyTasks.length > 0 ? Math.round(dailyCompleted / dailyTasks.length * 100) : 0

    return (
        <main className={styles.main}>
            {/* HEADER */}
            <header className={styles.header}>
                <Link href="/" className={styles.backButton}>← 홈</Link>
                <h1 className={`${styles.headerTitle} text-gradient`}>꿈 실현 플래너</h1>
                <div className={styles.headerActions}>
                    <button
                        className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
                        onClick={handleCopyLink}
                    >
                        {copySuccess ? '✅ 복사됨' : '🔗 링크복사'}
                    </button>
                    <button
                        className={styles.pdfButton}
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? '처리 중...' : '📄 PDF'}
                    </button>
                </div>
            </header>

            {/* PROGRESS BAR */}
            <div className={styles.progressSection}>
                <div className={`${styles.progressInfo} ${progressPercent === 100 ? styles.complete : ''}`}>
                    {totalCount > 0
                        ? `${completedCount} / ${totalCount} 월단위 목표 완료 (${progressPercent}%)`
                        : '마일스톤을 생성하는 중...'}
                </div>
                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressFill} ${progressPercent === 100 ? styles.complete : ''}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div id="planner-content" className={styles.content}>

                {/* 1. GOAL CARD */}
                <div className={styles.goalCard}>
                    <div className={styles.goalHeader}>
                        <span className={styles.goalIcon}>🎯</span>
                        <div className={styles.goalMeta}>
                            <p className={styles.goalSummary}>{goal.summary}</p>
                            <div className={styles.goalBadges}>
                                {dDay && (
                                    <span className={`${styles.dDayBadge} ${dDayClass}`}>{dDay}</span>
                                )}
                                <span className={styles.setDate}>
                                    설정일 {formatDate(goal.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.goalDivider} />

                    <button
                        className={styles.smartToggle}
                        onClick={() => setIsSmartExpanded(p => !p)}
                    >
                        <span className={`${styles.chevron} ${isSmartExpanded ? styles.open : ''}`}>▼</span>
                        SMART 목표 {isSmartExpanded ? '접기' : '보기'}
                    </button>

                    <div className={`${styles.smartContent} ${isSmartExpanded ? styles.open : ''}`}>
                        <div className={styles.smartGrid}>
                            {[
                                { label: 'S — 구체적', value: goal.smart_specific },
                                { label: 'M — 측정가능', value: goal.smart_measurable },
                                { label: 'A — 달성가능', value: goal.smart_achievable },
                                { label: 'R — 관련성', value: goal.smart_relevant },
                                { label: 'T — 기한', value: goal.smart_time_bound },
                            ].map(item => (
                                <div key={item.label} className={styles.smartItem}>
                                    <div className={styles.smartLabel}>{item.label}</div>
                                    <div className={styles.smartValue}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. 월단위 목표 (마일스톤) */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📅 월단위 목표</h2>
                        <button
                            className={styles.addButton}
                            onClick={() => setShowAddMilestone(p => !p)}
                        >
                            + 추가
                        </button>
                    </div>

                    {generatingMilestones ? (
                        <div>
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} />
                            <p className={styles.generatingText}>
                                <span className={styles.spinner} style={{ width: 16, height: 16, borderWidth: 2 }} />
                                AI가 월단위 목표를 생성하는 중...
                            </p>
                        </div>
                    ) : (
                        <div className={styles.timeline}>
                            {milestones.length === 0 && !showAddMilestone && (
                                <p className={styles.emptyText}>월단위 목표를 추가해보세요.</p>
                            )}
                            {milestones.map((ms, idx) => {
                                const overdue = !ms.is_completed && isDueDateOverdue(ms.due_date)
                                return (
                                    <div
                                        key={ms.id}
                                        className={`${styles.milestoneItem} ${dragOverIndex === idx ? styles.dragOver : ''} ${dragIndex === idx ? styles.dragging : ''}`}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={e => handleDragOver(e, idx)}
                                        onDrop={() => handleDrop(idx)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className={`${styles.milestoneDot} ${ms.is_completed ? styles.completed : styles.pending}`} />
                                        <div className={`${styles.milestoneBody} ${ms.is_completed ? styles.completed : ''}`}>
                                            <span className={styles.dragHandle} title="드래그로 순서 변경">⠿</span>
                                            <button
                                                className={`${styles.milestoneCheck} ${ms.is_completed ? styles.checked : ''}`}
                                                onClick={() => handleToggleMilestone(ms)}
                                                title={ms.is_completed ? '완료 취소' : '완료 표시'}
                                            >
                                                {ms.is_completed ? '✓' : ''}
                                            </button>
                                            <div className={styles.milestoneInfo}>
                                                <p className={`${styles.milestoneTitle} ${ms.is_completed ? styles.strikethrough : ''}`}>
                                                    {ms.title}
                                                </p>
                                                {ms.due_date && (
                                                    <p className={`${styles.milestoneDue} ${overdue ? styles.overdue : ''}`}>
                                                        {formatDate(ms.due_date)}{overdue ? ' (기한 초과)' : ''}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteMilestone(ms.id)}
                                                title="삭제"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {showAddMilestone && (
                        <form className={styles.inlineForm} onSubmit={handleAddMilestone}>
                            <div className={styles.formRow}>
                                <input
                                    className="input"
                                    placeholder="월단위 목표 제목"
                                    value={newMilestoneTitle}
                                    onChange={e => setNewMilestoneTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddMilestone(e as any)}
                                    autoFocus
                                />
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={newMilestoneDue}
                                    onChange={e => setNewMilestoneDue(e.target.value)}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowAddMilestone(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={addingMilestone || !newMilestoneTitle.trim()}
                                >
                                    {addingMilestone ? '추가 중...' : '추가'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* 3. 주간 목표 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📌 주간 목표</h2>
                        <span className={styles.weekBadge}>{formatWeekLabel(currentWeekStart)}</span>
                    </div>

                    <div className={styles.weeklyGoalBox}>
                        {isEditingGoal ? (
                            <div className={styles.goalEditRow}>
                                <input
                                    className="input"
                                    placeholder="이번 주 핵심 목표를 입력하세요"
                                    value={goalText}
                                    onChange={e => setGoalText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
                                    autoFocus
                                />
                                <div className={styles.formActions} style={{ marginTop: 'var(--space-sm)' }}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => {
                                            setIsEditingGoal(false)
                                            setGoalText(weeklyGoal?.goal_text ?? '')
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleSaveGoal}
                                        disabled={savingGoal || !goalText.trim()}
                                    >
                                        {savingGoal ? '저장 중...' : '저장'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.goalDisplay}>
                                {weeklyGoal?.goal_text ? (
                                    <p className={styles.weeklyGoalText}>{weeklyGoal.goal_text}</p>
                                ) : (
                                    <p className={styles.emptyGoal}>이번 주 핵심 목표를 설정해보세요.</p>
                                )}
                                <button
                                    className={styles.editGoalBtn}
                                    onClick={() => setIsEditingGoal(true)}
                                >
                                    {weeklyGoal?.goal_text ? '✏️ 수정' : '+ 설정'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. 일일 일정 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📋 일일 일정</h2>
                        <button className={styles.addButton} onClick={() => setShowAddDaily(p => !p)}>
                            + 추가
                        </button>
                    </div>

                    {/* 주 네비게이터 */}
                    <div className={styles.weekNavRow}>
                        <button
                            className={styles.weekNavBtn}
                            onClick={() => setSelectedDate(d => offsetDate(d, -7))}
                        >
                            ‹ 이전 주
                        </button>
                        <span className={styles.weekNavLabel}>{formatWeekLabel(currentWeekStart)}</span>
                        <button
                            className={styles.weekNavBtn}
                            onClick={() => setSelectedDate(d => offsetDate(d, 7))}
                        >
                            다음 주 ›
                        </button>
                    </div>

                    {/* 7일 요일 선택 */}
                    <div className={styles.weekDayGrid}>
                        {(() => {
                            const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일']
                            return Array.from({ length: 7 }, (_, i) => {
                                const date = offsetDate(currentWeekStart, i)
                                const dayNum = new Date(date + 'T00:00:00').getDate()
                                const isToday = date === todayStr
                                const isSelected = date === selectedDate
                                return (
                                    <button
                                        key={date}
                                        className={`${styles.weekDayBtn} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.todayDay : ''}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <span className={styles.weekDayName}>{DAY_NAMES[i]}</span>
                                        <span className={styles.weekDayNum}>{dayNum}</span>
                                        {isToday && <span className={styles.todayDot} />}
                                    </button>
                                )
                            })
                        })()}
                    </div>

                    {/* 선택된 날짜 표시 */}
                    <p className={styles.selectedDateLabel}>{formatDayLabel(selectedDate)}</p>

                    {/* 완료율 */}
                    {dailyTasks.length > 0 && (
                        <div className={styles.weekProgress}>
                            <div className={styles.weekProgressInfo}>
                                <span>{dailyCompleted} / {dailyTasks.length} 완료</span>
                                <span>{dailyPercent}%</span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${dailyPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* 일정 목록 */}
                    <div className={styles.weeklyList}>
                        {dailyTasks.length === 0 && !showAddDaily && (
                            <p className={styles.emptyText}>이 날의 일정을 추가해보세요.</p>
                        )}
                        {dailyTasks.map(task => (
                            <div key={task.id} className={`${styles.weeklyItem} ${task.is_completed ? styles.doneItem : ''}`}>
                                <button
                                    className={`${styles.milestoneCheck} ${task.is_completed ? styles.checked : ''}`}
                                    onClick={() => handleToggleDaily(task)}
                                >
                                    {task.is_completed ? '✓' : ''}
                                </button>
                                {task.start_time && (
                                    <span className={styles.taskTime}>
                                        {task.start_time.slice(0, 5)}
                                        {task.end_time ? ` ~ ${task.end_time.slice(0, 5)}` : ''}
                                    </span>
                                )}
                                <span className={`${styles.weeklyTitle} ${task.is_completed ? styles.strikethrough : ''}`}>
                                    {task.title}
                                </span>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteDaily(task.id)}
                                    title="삭제"
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
                    </div>

                    {showAddDaily && (
                        <form className={styles.inlineForm} onSubmit={handleAddDaily}>
                            <input
                                className="input"
                                placeholder="일정 입력"
                                value={newDailyTitle}
                                onChange={e => setNewDailyTitle(e.target.value)}
                                autoFocus
                            />
                            <div className={styles.timeRow}>
                                <select
                                    className={styles.timeSelect}
                                    value={newStartTime}
                                    onChange={e => setNewStartTime(e.target.value)}
                                >
                                    <option value="">시작 시간</option>
                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <span className={styles.timeSep}>~</span>
                                <select
                                    className={styles.timeSelect}
                                    value={newEndTime}
                                    onChange={e => setNewEndTime(e.target.value)}
                                >
                                    <option value="">종료 시간</option>
                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className={styles.formActions} style={{ marginTop: 'var(--space-sm)' }}>
                                <button type="button" className={styles.cancelButton} onClick={() => { setShowAddDaily(false); setNewStartTime(''); setNewEndTime('') }}>취소</button>
                                <button type="submit" className={styles.submitButton} disabled={addingDaily || !newDailyTitle.trim()}>
                                    {addingDaily ? '추가 중...' : '추가'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* 5. 실행 로그 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📝 실행 로그</h2>
                        <button
                            className={styles.addButton}
                            onClick={() => setShowAddLog(p => !p)}
                        >
                            + 기록
                        </button>
                    </div>

                    {showAddLog && (
                        <form className={styles.inlineForm} onSubmit={handleAddLog} style={{ marginBottom: '1rem' }}>
                            <textarea
                                className={styles.textarea}
                                placeholder="오늘의 실행을 기록하세요..."
                                value={newLogContent}
                                onChange={e => setNewLogContent(e.target.value)}
                                autoFocus
                            />
                            <div className={styles.formRow} style={{ marginTop: 'var(--space-sm)' }}>
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={newLogDate}
                                    onChange={e => setNewLogDate(e.target.value)}
                                />
                                <div style={{ flex: 1 }} />
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowAddLog(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={addingLog || !newLogContent.trim()}
                                >
                                    {addingLog ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className={styles.logList}>
                        {logs.length === 0 && !showAddLog && (
                            <p className={styles.emptyText}>아직 기록이 없습니다. 오늘의 실행을 기록해보세요!</p>
                        )}
                        {logs.map(log => (
                            <div key={log.id} className={styles.logItem}>
                                <span className={styles.logDate}>{formatDate(log.log_date)}</span>
                                <p className={styles.logContent}>{log.content}</p>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteLog(log.id)}
                                    title="삭제"
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
