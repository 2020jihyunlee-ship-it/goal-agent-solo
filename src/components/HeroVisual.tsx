'use client'

import { useState } from 'react'
import styles from './HeroVisual.module.css'

const TABS = [
  { key: 'chat',    label: '🤖 AI 코칭' },
  { key: 'planner', label: '📋 플래너' },
  { key: 'pdf',     label: '📄 PDF' },
] as const

type Tab = typeof TABS[number]['key']

export default function HeroVisual() {
  const [active, setActive] = useState<Tab>('chat')

  return (
    <div className={styles.wrapper}>
      {/* Floating badges */}
      <div className={`${styles.floatBadge} ${styles.floatBadge1}`}>
        <span className={`${styles.floatDot} ${styles.floatDotGreen}`} />
        SMART 목표 자동 완성
      </div>
      <div className={`${styles.floatBadge} ${styles.floatBadge2}`}>
        <span className={`${styles.floatDot} ${styles.floatDotPurple}`} />
        AI 실시간 코칭
      </div>
      <div className={`${styles.floatBadge} ${styles.floatBadge3}`}>
        <span className={`${styles.floatDot} ${styles.floatDotBlue}`} />
        꿈 실현 플래너 제공
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        {/* macOS-style top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarDots}>
            <span className={`${styles.topBarDot} ${styles.dotRed}`} />
            <span className={`${styles.topBarDot} ${styles.dotYellow}`} />
            <span className={`${styles.topBarDot} ${styles.dotGreen}`} />
          </div>
          <span className={styles.topBarLabel}>Goal Agent Planner</span>
          <div style={{ width: 52 }} />
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Chat Panel ── */}
        {active === 'chat' && (
          <div className={styles.panel}>
            <div className={styles.chatHeader}>
              <span className={styles.onlineDot} />
              <span className={styles.chatTitle}>AI 코치</span>
              <span className={styles.chatSubtitle}>5단계 자기이해 프로세스</span>
            </div>
            <div className={styles.messages}>
              <div className={styles.aiRow}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.aiMsg}>&quot;어떤 목표를 가슴에 품고 계신가요?&quot;</div>
              </div>
              <div className={styles.userMsg}>온라인 코칭 비즈니스 시작하고 싶어요</div>
              <div className={styles.aiRow}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.aiMsg}>&quot;지금 현실과 원하는 상태의 차이는 무엇인가요?&quot;</div>
              </div>
              <div className={styles.userMsg}>아직 첫 고객이 없어요</div>
              <div className={styles.aiRow}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.aiMsg}>&quot;왜 이것이 지금 당신에게 중요한가요?&quot;</div>
              </div>
              <div className={styles.typingDots}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* ── Planner Panel ── */}
        {active === 'planner' && (
          <div className={styles.panel}>
            <div className={styles.plannerGoal}>
              <div className={styles.plannerGoalTitle}>🎯 온라인 코칭 비즈니스 월 500만원</div>
              <div className={styles.plannerMeta}>
                <span className={styles.dday}>D-312</span>
                <span className={styles.plannerDate}>설정일 2026.02.22</span>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressTop}>
                <span className={styles.progressTitle}>마일스톤 진행률</span>
                <span className={styles.progressLabel}>2 / 6 완료 (33%)</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '33%' }} />
              </div>
            </div>

            <div className={styles.milestones}>
              <div className={styles.msItem}>
                <div className={styles.msDotDone}>✓</div>
                <div className={styles.msContent}>
                  <span className={styles.msDateDone}>03월</span>
                  <span className={styles.msTitleDone}>커리큘럼 설계 완료</span>
                </div>
              </div>
              <div className={styles.msItem}>
                <div className={styles.msDotDone}>✓</div>
                <div className={styles.msContent}>
                  <span className={styles.msDateDone}>04월</span>
                  <span className={styles.msTitleDone}>무료 세션 후기 3개 확보</span>
                </div>
              </div>
              <div className={styles.msItem}>
                <div className={styles.msDotPending} />
                <div className={styles.msContent}>
                  <span className={styles.msDate}>06월</span>
                  <span className={styles.msTitle}>첫 유료 고객 5명 달성</span>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.weekSection}>
              <div className={styles.weekLabel}>이번 주 목표</div>
              <div className={styles.weekGoal}>잠재 고객 연락 + SNS 콘텐츠 3개 발행</div>
            </div>

            <div className={styles.taskRow}>
              <div className={`${styles.taskItem} ${styles.taskItemDone}`}>
                <span className={styles.taskDone}>✓</span>
                <span className={styles.taskTime}>09:00</span>
                <span>유료 제안 DM 발송</span>
              </div>
              <div className={styles.taskItem}>
                <span className={styles.taskPending} />
                <span className={styles.taskTime}>14:00</span>
                <span>인스타그램 게시물 작성</span>
              </div>
            </div>
          </div>
        )}

        {/* ── PDF Panel ── */}
        {active === 'pdf' && (
          <div className={styles.panel}>
            <div className={styles.pdfHeader}>
              <div className={styles.pdfHeaderLeft}>
                <div className={styles.pdfTag}>SMART 목표 달성 리포트</div>
                <div className={styles.pdfHeaderTitle}>온라인 코칭 비즈니스<br />월 매출 500만원</div>
              </div>
              <div className={styles.pdfScoreCircle}>
                <div className={styles.pdfScoreNum}>82</div>
                <div className={styles.pdfScoreUnit}>/ 100점</div>
              </div>
            </div>

            <div className={styles.pdfBars}>
              {[
                { label: '자기이해',   val: 88, width: '88%' },
                { label: '문제정의',   val: 78, width: '78%' },
                { label: '구체성',     val: 85, width: '85%' },
                { label: '실행계획',   val: 77, width: '77%' },
              ].map(item => (
                <div key={item.label} className={styles.pdfScoreRow}>
                  <span className={styles.pdfScoreLabel}>{item.label}</span>
                  <div className={styles.pdfBarTrack}>
                    <div className={styles.pdfBarFill} style={{ width: item.width }} />
                  </div>
                  <span className={styles.pdfScoreVal}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className={styles.pdfSmartBlock}>
              <div className={styles.pdfBlockTitle}>SMART 목표 요약</div>
              <div className={styles.pdfRow}>
                <span className={`${styles.pdfBadge} ${styles.pdfBadgeS}`}>S</span>
                <span className={styles.pdfRowText}>온라인 코칭 프로그램 운영, 유료 고객 5명 확보</span>
              </div>
              <div className={styles.pdfRow}>
                <span className={`${styles.pdfBadge} ${styles.pdfBadgeM}`}>M</span>
                <span className={styles.pdfRowText}>유료 고객 수 및 월 매출(원)으로 측정</span>
              </div>
              <div className={styles.pdfRow}>
                <span className={`${styles.pdfBadge} ${styles.pdfBadgeT}`}>T</span>
                <span className={styles.pdfRowText}>2026년 12월 31일까지</span>
              </div>
            </div>

            <div className={styles.pdfCoaching}>
              <div className={styles.pdfCoachingLabel}>
                ✦ AI 코칭 멘트
              </div>
              <div className={styles.pdfCoachingText}>
                &quot;당신은 이미 충분한 역량을 갖추고 있습니다. 필요한 것은 완벽한 준비가 아닌, 첫 행동입니다.&quot;
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
