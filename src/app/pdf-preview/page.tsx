'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { downloadPdf } from '@/lib/pdf'

const SAMPLE = {
    userName: '',
    summary: '2026년 12월까지 온라인 목표설정 코칭 프로그램으로 월 매출 500만원을 달성한다',
    original_goal: '내 사업을 시작하고 싶어요',
    smart_specific: '온라인 목표설정 코칭 프로그램을 개발하여 월 10명의 유료 수강생을 확보한다',
    smart_measurable: '월 매출 500만원, 수강생 만족도 4.5점(5점 만점) 이상 유지',
    smart_achievable: '현재 코칭 경험과 AI 도구를 활용해 3개월 내 첫 프로그램을 출시한다',
    smart_relevant: '나만의 경험을 바탕으로 타인의 성장을 도우며 경제적 자유를 실현하는 것이 핵심 가치',
    smart_time_bound: '2026년 12월 31일까지',
    intrinsic_motivation: '스스로 설계한 삶을 살고 싶은 욕구, 그리고 타인의 성장을 도왔을 때 느끼는 깊은 보람이 이 목표의 핵심 원동력입니다. 무언가를 만들어내는 창조의 기쁨과 자아실현의 욕구가 강하게 작동하고 있습니다.',
    extrinsic_motivation: '경제적 독립을 통해 가족에게 더 나은 환경을 제공하고 싶은 마음, 그리고 성공한 코치로서 사회적으로 인정받고자 하는 욕구도 중요한 동기로 작용하고 있습니다.',
    coaching_message: '당신이 발견한 "타인의 성장을 돕는 기쁨"은 오래가는 동기의 원천입니다. 처음 한 명의 고객에게 온전히 집중하세요. 완벽한 프로그램보다 진정성 있는 연결이 먼저입니다. 매달 작은 성과를 기록하고, 그 기록이 지치는 날의 연료가 될 것입니다. 당신은 이미 시작했습니다.',
    competency_scores: { total: 82, self_awareness: 88, problem_definition: 78, specificity: 80, action_planning: 82 },
    analysis: {
        strengths: [
            '자신의 진짜 동기(타인 성장 기여)를 명확하게 인식함',
            '현재 상태와 목표 간 갭을 구체적으로 파악함',
            'SMART 기준에 맞는 측정 가능한 목표를 스스로 설계함',
        ],
        improvements: [
            '초기 고객 확보 채널 전략을 더 구체화할 필요 있음',
            '수입 공백 기간 대비 재정 계획 준비 권장',
        ],
        next_steps: [
            '이번 달: 첫 코칭 프로그램 커리큘럼 초안 작성',
            '다음 달: 베타 수강생 3명 모집 및 무료 파일럿 운영',
            '3개월 후: 피드백 반영 후 유료 전환 시작',
        ],
    },
}

export default function PdfPreviewPage() {
    const [userName, setUserName] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserName(user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자')
        })
    }, [])

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            const dateStr = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')
            await downloadPdf({
                filename: `KINGCLE_목표설정_리포트_샘플_${dateStr}.pdf`,
                elementId: 'pdf-preview-template',
            })
        } finally {
            setIsDownloading(false)
        }
    }

    const data = { ...SAMPLE, userName }

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            {/* 컨트롤 바 */}
            <div style={{ width: '794px', maxWidth: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <a href="/agents/goal" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← 목표 에이전트</a>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #3b82f6)', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: isDownloading ? 0.7 : 1 }}
                >
                    {isDownloading ? '생성 중...' : '📄 PDF 다운로드'}
                </button>
            </div>

            {/* PDF 템플릿 (가시화) */}
            <PdfTemplate data={data} />
        </div>
    )
}

function PdfTemplate({ data }: { data: typeof SAMPLE & { userName: string } }) {
    return (
        <div
            id="pdf-preview-template"
            style={{
                width: '794px',
                maxWidth: '100%',
                background: '#ffffff',
                color: '#1a1a2e',
                fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif',
                fontSize: '13px',
                lineHeight: '1.6',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
        >
            {/* 상단 컬러 라인 */}
            <div style={{ height: '5px', background: 'linear-gradient(90deg, #6d28d9, #3b82f6, #06b6d4)' }} />

            {/* 헤더 */}
            <div style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1557 50%, #1e3a5f 100%)', padding: '36px 48px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(109,40,217,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', right: '120px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)' }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '9px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontWeight: 600 }}>KINGCLE EXPANSION OS · GOAL AGENT</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '0.5px', marginBottom: '4px' }}>목표설정 리포트</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '1px' }}>G-STAR ENGINE · AI Goal Coaching</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>{data.userName}님</div>
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
                            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '32px 48px' }}>

                {/* 핵심 목표 */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #faf5ff, #eff6ff)', border: '1.5px solid rgba(109,40,217,0.3)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #6d28d9, #3b82f6)', borderRadius: '12px 0 0 12px' }} />
                        <div style={{ paddingLeft: '8px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#6d28d9', letterSpacing: '2px', marginBottom: '10px' }}>나의 SMART 목표</div>
                            <div style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.5, marginBottom: '14px' }}>{data.summary}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(109,40,217,0.12)' }}>
                                <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>처음 표현한 바람: "{data.original_goal}"</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SMART 세부 */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>SMART 목표 세부 내용</div>
                    </div>
                    <div style={{ border: '1px solid #e8e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        {[
                            { key: 'S', label: '구체적 (Specific)', value: data.smart_specific, bg: '#f5f3ff', color: '#6d28d9', border: '#ede9fe' },
                            { key: 'M', label: '측정가능 (Measurable)', value: data.smart_measurable, bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
                            { key: 'A', label: '달성가능 (Achievable)', value: data.smart_achievable, bg: '#ecfeff', color: '#0891b2', border: '#cffafe' },
                            { key: 'R', label: '관련성 (Relevant)', value: data.smart_relevant, bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7' },
                            { key: 'T', label: '기한 (Time-bound)', value: data.smart_time_bound, bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
                        ].map((item, idx) => (
                            <div key={item.key} style={{ display: 'flex', alignItems: 'stretch', borderBottom: idx < 4 ? '1px solid #f0f0f5' : 'none' }}>
                                <div style={{ width: '48px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: `1px solid ${item.border}` }}>
                                    <div style={{ width: '26px', height: '26px', background: item.color, color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{item.key}</div>
                                </div>
                                <div style={{ flex: 1, padding: '10px 16px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 700, color: item.color, letterSpacing: '1px', marginBottom: '3px' }}>{item.label}</div>
                                    <div style={{ fontSize: '12px', color: '#333', lineHeight: 1.55 }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 동기 분석 */}
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
                                <div style={{ fontSize: '12px', color: '#3b1f6b', lineHeight: 1.75 }}>{data.intrinsic_motivation}</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, border: '1.5px solid #dbeafe', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ padding: '10px 16px', background: '#2563eb' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>외적 동기 (Extrinsic)</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>인정 · 결과 · 보상 · 기여</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: '#eff6ff' }}>
                                <div style={{ fontSize: '12px', color: '#1e3a6b', lineHeight: 1.75 }}>{data.extrinsic_motivation}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 역량 점수 */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>목표설정 역량 점수</div>
                    </div>
                    <div style={{ padding: '20px 24px', border: '1px solid #e8e8f0', borderRadius: '10px', background: '#fafafa' }}>
                        {[
                            { label: '자기이해 (Self-Awareness)', score: data.competency_scores.self_awareness, color: '#6d28d9' },
                            { label: '문제 정의 (Problem Definition)', score: data.competency_scores.problem_definition, color: '#2563eb' },
                            { label: '목표설정방법 (Specificity)', score: data.competency_scores.specificity, color: '#0891b2' },
                            { label: '구체화 (Action Planning)', score: data.competency_scores.action_planning, color: '#059669' },
                        ].map(item => (
                            <div key={item.label} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '160px', flexShrink: 0, fontSize: '11px', color: '#444', fontWeight: 500 }}>{item.label}</div>
                                <div style={{ flex: 1, height: '10px', background: '#e8e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${item.score}%`, background: item.color, borderRadius: '5px' }} />
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
                                <div style={{ fontSize: '36px', fontWeight: 900, color: '#6d28d9', lineHeight: 1 }}>{data.competency_scores.total}</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>/ 100</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 분석 결과 */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '3px', height: '18px', background: '#6d28d9', borderRadius: '2px' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>분석 결과</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                            { title: '강점', emoji: '✅', items: data.analysis.strengths, bg: '#f0fdf4', header: '#16a34a', border: '#bbf7d0', textColor: '#14532d' },
                            { title: '개선점', emoji: '🔍', items: data.analysis.improvements, bg: '#fff7ed', header: '#ea580c', border: '#fed7aa', textColor: '#7c2d12' },
                            { title: '다음 단계', emoji: '🚀', items: data.analysis.next_steps, bg: '#eff6ff', header: '#2563eb', border: '#bfdbfe', textColor: '#1e3a5f' },
                        ].map(col => (
                            <div key={col.title} style={{ flex: 1, border: `1.5px solid ${col.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 14px', background: col.header }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{col.emoji} {col.title}</div>
                                </div>
                                <div style={{ padding: '12px 14px', background: col.bg, minHeight: '80px' }}>
                                    {col.items.map((s, i) => (
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

                {/* 코칭 멘트 */}
                <div style={{ marginBottom: '4px', padding: '24px 28px', background: 'linear-gradient(135deg, #1e0a3c, #1e3a5f)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '60px', color: 'rgba(255,255,255,0.06)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(167,139,250,1)', letterSpacing: '2px', marginBottom: '12px' }}>💪 코칭 멘트 — 끝까지 달성하는 법</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.88)', lineHeight: 2, fontStyle: 'italic' }}>{data.coaching_message}</div>
                    </div>
                </div>

            </div>

            {/* 하단 라인 + 푸터 */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #6d28d9, #3b82f6, #06b6d4)' }} />
            <div style={{ padding: '14px 48px', background: '#f9f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.5px' }}>© 2026 Kingcle Expansion OS · All Rights Reserved</div>
                <div style={{ fontSize: '10px', color: '#aaa' }}>Powered by G-STAR ENGINE · Gemini AI</div>
            </div>
        </div>
    )
}
