'use client'

import { useEffect, useState, useCallback } from 'react'
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
    const d = new Date(dateStr)
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

export default function PlannerPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const sessionId = params.id

    const [goal, setGoal] = useState<Goal | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [generatingMilestones, setGeneratingMilestones] = useState(false)

    const [isSmartExpanded, setIsSmartExpanded] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Add milestone form
    const [showAddMilestone, setShowAddMilestone] = useState(false)
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
    const [newMilestoneDue, setNewMilestoneDue] = useState('')
    const [addingMilestone, setAddingMilestone] = useState(false)

    // Add log form
    const [showAddLog, setShowAddLog] = useState(false)
    const [newLogContent, setNewLogContent] = useState('')
    const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0])
    const [addingLog, setAddingLog] = useState(false)

    const completedCount = milestones.filter(m => m.is_completed).length
    const totalCount = milestones.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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

    const handleToggleMilestone = useCallback(async (ms: Milestone) => {
        const newVal = !ms.is_completed
        // optimistic update
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

    return (
        <main className={styles.main}>
            {/* HEADER */}
            <header className={styles.header}>
                <Link href="/" className={styles.backButton}>← 홈</Link>
                <h1 className={`${styles.headerTitle} text-gradient`}>나의 플래너</h1>
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
                        ? `${completedCount} / ${totalCount} 마일스톤 완료 (${progressPercent}%)`
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
                {/* GOAL CARD */}
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

                {/* MILESTONE SECTION */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📅 마일스톤</h2>
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
                                AI가 마일스톤을 생성하는 중...
                            </p>
                        </div>
                    ) : (
                        <div className={styles.timeline}>
                            {milestones.length === 0 && !showAddMilestone && (
                                <p className={styles.emptyText}>마일스톤을 추가해보세요.</p>
                            )}
                            {milestones.map(ms => {
                                const overdue = !ms.is_completed && isDueDateOverdue(ms.due_date)
                                return (
                                    <div key={ms.id} className={styles.milestoneItem}>
                                        <div className={`${styles.milestoneDot} ${ms.is_completed ? styles.completed : styles.pending}`} />
                                        <div className={`${styles.milestoneBody} ${ms.is_completed ? styles.completed : ''}`}>
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
                                    placeholder="마일스톤 제목"
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

                {/* LOG SECTION */}
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
