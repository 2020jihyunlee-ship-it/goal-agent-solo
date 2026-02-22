'use client'

import { useState } from 'react'
import styles from './HeroVisual.module.css'

const TABS = [
  { key: 'chat', label: '🤖 AI 코칭' },
  { key: 'planner', label: '📋 플래너' },
  { key: 'pdf', label: '📄 PDF' },
] as const

type Tab = typeof TABS[number]['key']

export default function HeroVisual() {
  const [active, setActive] = useState<Tab>('chat')

  return (
    <div className={styles.card}>
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

      {/* Chat Tab */}
      {active === 'chat' && (
        <div className={styles.panel}>
          <div className={styles.chatHeader}>
            <span className={styles.onlineDot}></span>
            <span className={styles.chatTitle}>AI 코치</span>
          </div>
          <div className={styles.messages}>
            <div className={styles.aiMsg}>&quot;어떤 목표를 가슴에 품고 계신가요?&quot;</div>
            <div className={styles.userMsg}>온라인 코칭 비즈니스 시작하고 싶어요</div>
            <div className={styles.aiMsg}>&quot;지금 현실과 원하는 상태의 차이는 무엇인가요?&quot;</div>
            <div className={styles.userMsg}>아직 첫 고객이 없어요</div>
            <div className={styles.aiMsg}>&quot;왜 이것이 지금 당신에게 중요한가요?&quot;</div>
            <div className={styles.typingDots}>
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      {/* Planner Tab */}
      {active === 'planner' && (
        <div className={styles.panel}>
          <div className={styles.plannerGoal}>
            <div className={styles.plannerGoalTitle}>🎯 온라인 코칭 비즈니스 월 500만원</div>
            <div className={styles.plannerMeta}>
              <span className={styles.dday}>D-312</span>
              <span className={styles.plannerDate}>설정일 2026.02.22</span>
            </div>
          </div>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '33%' }} />
            </div>
            <span className={styles.progressLabel}>2 / 6 완료</span>
          </div>
          <div className={styles.milestones}>
            <div className={styles.msItem}>
              <span className={styles.msDotDone} />
              <span className={styles.msDateDone}>03월</span>
              <span className={styles.msTitleDone}>커리큘럼 설계 완료</span>
            </div>
            <div className={styles.msItem}>
              <span className={styles.msDotDone} />
              <span className={styles.msDateDone}>04월</span>
              <span className={styles.msTitleDone}>무료 세션 후기 3개 확보</span>
            </div>
            <div className={styles.msItem}>
              <span className={styles.msDotPending} />
              <span className={styles.msDate}>06월</span>
              <span className={styles.msTitle}>첫 유료 고객 5명 달성</span>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.weekSection}>
            <div className={styles.weekLabel}>이번 주 목표</div>
            <div className={styles.weekGoal}>잠재 고객 연락 + 콘텐츠 3개 발행</div>
          </div>
          <div className={styles.todaySection}>
            <div className={styles.weekLabel}>오늘 일정</div>
            <div className={styles.taskItem}><span className={styles.taskDone}>✓</span> 09:00 유료 제안 DM 발송</div>
            <div className={styles.taskItem}><span className={styles.taskPending}>○</span> 14:00 인스타그램 게시물 작성</div>
          </div>
        </div>
      )}

      {/* PDF Tab */}
      {active === 'pdf' && (
        <div className={styles.panel}>
          <div className={styles.pdfHeader}>
            <div className={styles.pdfHeaderTitle}>SMART 목표 달성 리포트</div>
            <div className={styles.pdfScore}>82점</div>
          </div>
          <div className={styles.pdfScoreBar}>
            <span className={styles.pdfScoreLabel}>목표설정 역량</span>
            <div className={styles.pdfBar}><div className={styles.pdfBarFill} style={{ width: '82%' }} /></div>
            <span className={styles.pdfScoreNum}>82</span>
          </div>
          <div className={styles.pdfSmartTable}>
            <div className={styles.pdfRow}>
              <span className={styles.pdfBadgeS}>S</span>
              <span className={styles.pdfRowText}>온라인 코칭 프로그램 — 유료 고객 5명</span>
            </div>
            <div className={styles.pdfRow}>
              <span className={styles.pdfBadgeM}>M</span>
              <span className={styles.pdfRowText}>유료 고객 수, 월 매출(원) 측정</span>
            </div>
            <div className={styles.pdfRow}>
              <span className={styles.pdfBadgeT}>T</span>
              <span className={styles.pdfRowText}>2026년 12월 31일까지</span>
            </div>
          </div>
          <div className={styles.pdfCoaching}>
            <div className={styles.pdfCoachingLabel}>코칭 멘트</div>
            <div className={styles.pdfCoachingText}>
              &quot;당신은 이미 충분한 역량을 갖추고 있습니다. 필요한 것은 완벽한 준비가 아닌, 첫 행동입니다.&quot;
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
