'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AgentNavigator from '@/components/navigation/AgentNavigator'
import styles from './page.module.css'
import { downloadPdf } from '@/lib/pdf'

export default function SessionResultPage({ params }: { params: { id: string } }) {
    const [goal, setGoal] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const supabase = createClient()

    const handleDownloadPdf = async () => {
        setIsDownloading(true)
        try {
            const dateStr = new Date().toISOString().split('T')[0]
            await downloadPdf({
                filename: `G-STAR_Strategic_Goal_${dateStr}.pdf`,
                elementId: 'result-report'
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
                console.error('Fetch Result Error:', error)
            } else {
                setGoal(data)
            }
            setLoading(false)
        }
        fetchGoal()
    }, [params.id])

    if (loading) return <div className={styles.loading}>리포트를 불러오는 중...</div>
    if (!goal) return notFound()

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.backLink}>← 홈</Link>
                    <h1 className={styles.title}>
                        <span className="text-gradient">KINGCLE</span> AI 리포트
                    </h1>
                    <button
                        className={styles.pdfButton}
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? '📄 처리 중...' : '📄 PDF 리포트'}
                    </button>
                </div>
            </header>

            <AgentNavigator currentStep="goal" />

            <div className={styles.container}>
                <div id="result-report" className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                        <div className={styles.icon}>🎯</div>
                        <div className={styles.summary}>
                            <h2>{goal.summary}</h2>
                            <p className={styles.date}>설정일: {new Date(goal.created_at).toLocaleDateString('ko-KR')}</p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>원래 목표</h3>
                        <div className={styles.contentBox}>
                            {goal.original_goal}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>근본 동기 및 원인</h3>
                        <div className={styles.contentBox}>
                            {goal.root_cause}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>SMART 분석</h3>
                        <div className={styles.smartGrid}>
                            <div className={styles.smartItem}>
                                <div className={styles.smartLabel}>S (Specific)</div>
                                <div className={styles.smartValue}>{goal.smart_specific}</div>
                            </div>
                            <div className={styles.smartItem}>
                                <div className={styles.smartLabel}>M (Measurable)</div>
                                <div className={styles.smartValue}>{goal.smart_measurable}</div>
                            </div>
                            <div className={styles.smartItem}>
                                <div className={styles.smartLabel}>A (Achievable)</div>
                                <div className={styles.smartValue}>{goal.smart_achievable}</div>
                            </div>
                            <div className={styles.smartItem}>
                                <div className={styles.smartLabel}>R (Relevant)</div>
                                <div className={styles.smartValue}>{goal.smart_relevant}</div>
                            </div>
                            <div className={styles.smartItem}>
                                <div className={styles.smartLabel}>T (Time-bound)</div>
                                <div className={styles.smartValue}>{goal.smart_time_bound}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>🚀 다음 단계: 첫 번째 행동 지침 (Action Plan)</h3>
                        <div className={styles.actionPlanBox}>
                            <div className={styles.actionItem}>
                                <div className={styles.actionNum}>1</div>
                                <div className={styles.actionText}>
                                    <strong>{goal.smart_specific.split('.')[0]}</strong>을(를) 위한 준비를 오늘 바로 시작하세요.
                                </div>
                            </div>
                            <div className={styles.actionItem}>
                                <div className={styles.actionNum}>2</div>
                                <div className={styles.actionText}>
                                    <strong>{goal.smart_time_bound}</strong>까지 목표를 달성하기 위한 구체적인 주간 일정을 수립해 보세요.
                                </div>
                            </div>
                            <div className={styles.actionItem}>
                                <div className={styles.actionNum}>3</div>
                                <div className={styles.actionText}>
                                    매일 <strong>{goal.smart_measurable.split('.')[0]}</strong> 여부를 체크하며 성취감을 기록해 보세요.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href={`/session/${params.id}/report`} className="btn btn-primary">
                            📊 역량 진단 리포트 보기
                        </Link>
                        <Link href="/agents/goal" className="btn btn-secondary">
                            새로운 목표 탐색
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
