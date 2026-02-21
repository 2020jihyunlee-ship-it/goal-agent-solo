'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { downloadPdf } from '@/lib/pdf'
import AgentNavigator from '@/components/navigation/AgentNavigator'
import CompetencyRadar from '@/components/visualization/CompetencyRadar'
import styles from './page.module.css'

interface GoalData {
    id: string
    original_goal: string
    root_cause: string
    smart_specific: string
    smart_measurable: string
    smart_achievable: string
    smart_relevant: string
    smart_time_bound: string
    summary: string
    score_total: number
    score_problem_definition: number
    score_self_awareness: number
    score_specificity: number
    score_action_planning: number
    analysis: {
        strengths: string[]
        improvements: string[]
        next_steps: string[]
    }
    created_at: string
}

export default function ReportPage({ params }: { params: { id: string } }) {
    const [goal, setGoal] = useState<GoalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const supabase = createClient()

    const handleDownloadPdf = async () => {
        setIsDownloading(true)
        try {
            const dateStr = new Date().toISOString().split('T')[0]
            await downloadPdf({
                filename: `KINGCLE_G-STAR_STRATEGIC_REPORT_${dateStr}.pdf`,
                elementId: 'pdf-content'
            })
        } finally {
            setIsDownloading(false)
        }
    }

    useEffect(() => {
        const fetchGoal = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                redirect('/login')
                return
            }

            const { data, error } = await supabase
                .from('final_goals')
                .select('*')
                .eq('session_id', params.id)
                .single()

            if (error || !data) {
                console.error('Fetch Report Error:', error)
            } else {
                setGoal(data as GoalData)
            }
            setLoading(false)
        }
        fetchGoal()
    }, [params.id])

    if (loading) return <div className={styles.loading}>리포트를 생성 중입니다...</div>
    if (!goal) return notFound()

    const scores = [
        { label: 'Problem Definition', value: goal.score_problem_definition },
        { label: 'Self Awareness', value: goal.score_self_awareness },
        { label: 'Specificity', value: goal.score_specificity },
        { label: 'Action Planning', value: goal.score_action_planning },
    ]

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'
        if (score >= 60) return '#7df9ff'
        if (score >= 40) return '#f59e0b'
        return '#ef4444'
    }

    const getGrade = (score: number) => {
        if (score >= 90) return 'STRATEGIC MASTER'
        if (score >= 80) return 'ADVANCED'
        if (score >= 70) return 'PRACTITIONER'
        if (score >= 60) return 'GROWING'
        return 'INITIATING'
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href={`/session/${params.id}`} className={styles.backLink}>← BACK TO SESSION</Link>
                    <div className={styles.title}>G-STAR STRATEGIC REPORT</div>
                    <button
                        className={styles.pdfButton}
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'GENERATING REPORT...' : 'DOWNLOAD PDF REPORT'}
                    </button>
                </div>
            </header>

            <AgentNavigator currentStep="goal" />

            <div id="pdf-content" className={styles.container}>
                {/* Official Cover Header */}
                <header className={styles.reportCover}>
                    <h1>STRATEGIC<br /><span className="text-gradient">CAPABILITY DIAGNOSIS</span></h1>
                    <p>Proprietary methodology for goal-centric performance optimization.</p>
                </header>

                {/* Score Card - Executive Summary */}
                <section className={styles.scoreCard}>
                    <div className={styles.analysisVisual}>
                        <div className={styles.radarWrapper}>
                            <CompetencyRadar data={scores} size={350} />
                        </div>
                        <div className={styles.totalScoreCompact}>
                            <div className={styles.scoreLabel}>OVERALL INDEX</div>
                            <div className={styles.scoreNumber}>{goal.score_total}</div>
                            <div className={styles.gradeBadge}>{getGrade(goal.score_total)}</div>
                        </div>
                    </div>

                    <div className={styles.scoreBars}>
                        <h3 className={styles.barsTitle}>COMPETENCY BREAKDOWN</h3>
                        {scores.map((item) => (
                            <div key={item.label} className={styles.scoreItem}>
                                <div className={styles.scoreHeader}>
                                    <span className={styles.scoreName}>{item.label}</span>
                                    <span className={styles.scoreValue}>{item.value} / 100</span>
                                </div>
                                <div className={styles.scoreBarBg}>
                                    <div
                                        className={styles.scoreBarFill}
                                        style={{
                                            width: `${item.value}%`,
                                            backgroundColor: getScoreColor(item.value),
                                            color: getScoreColor(item.value)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Strategic summary */}
                <section className={styles.section}>
                    <h2>EXECUTIVE SUMMARY</h2>
                    <div className={styles.goalSummary}>
                        <div className={styles.goalItem}>
                            <span className={styles.goalLabel}>ORIGINAL VISION</span>
                            <div className={styles.goalText}>{goal.original_goal}</div>
                        </div>
                        <div className={styles.goalItem}>
                            <span className={styles.goalLabel}>ROOT CAUSE ANALYSIS</span>
                            <div className={styles.goalText}>{goal.root_cause}</div>
                        </div>
                        <div className={styles.goalItem}>
                            <span className={styles.goalLabel}>REDEFINED SMART GOAL</span>
                            <div className={`${styles.goalText} ${styles.finalGoal}`}>{goal.summary}</div>
                        </div>
                    </div>
                </section>

                {/* Detailed Analysis */}
                <section className={styles.section}>
                    <h2>INSIGHT & OPTIMIZATION</h2>
                    <div className={styles.analysisGrid}>
                        <div className={styles.analysisCard}>
                            <h3>STRATEGIC STRENGTHS</h3>
                            <ul>
                                {(goal.analysis?.strengths || []).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.analysisCard}>
                            <h3>GROWTH OPPORTUNITIES</h3>
                            <ul>
                                {(goal.analysis?.improvements || []).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Recommended Path */}
                <section className={styles.section}>
                    <h2>RECOMMENDED STRATEGIC PATH</h2>
                    <div className={styles.nextSteps}>
                        {(goal.analysis?.next_steps || []).map((item, idx) => (
                            <div key={idx} className={styles.stepItem}>
                                <span className={styles.stepNum}>0{idx + 1}</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className={styles.actions}>
                    <Link href="/agents/strategy" className="btn btn-primary btn-lg">
                        ACTIVATE STRATEGY AGENT
                    </Link>
                    <Link href="/agents/goal" className="btn btn-secondary btn-lg">
                        INITIATE NEW SESSION
                    </Link>
                </div>

                <p className={styles.date}>
                    DOCUMENT GENERATED AT: {new Date(goal.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }).toUpperCase()} | CONFIDENTIAL
                </p>
            </div>
        </main>
    )
}
