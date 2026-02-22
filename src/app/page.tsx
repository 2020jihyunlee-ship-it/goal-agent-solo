import Link from 'next/link'
import styles from './page.module.css'
import AdminDemoButton from '@/components/AdminDemoButton'
import HeroVisual from '@/components/HeroVisual'

const pillars = [
  {
    icon: '🔍',
    title: '자기이해',
    subtitle: 'Self-Awareness',
    description: '내가 진정 원하는 것이 무엇인지, 어떤 가치를 중요하게 여기는지 탐색합니다. 막연한 바람을 진짜 욕구로 연결합니다.',
  },
  {
    icon: '📌',
    title: '문제 정의',
    subtitle: 'Problem Definition',
    description: '지금 현재 상태와 원하는 상태 사이의 갭을 명확히 합니다. 무엇이 나를 막고 있는지 직면합니다.',
  },
  {
    icon: '🎯',
    title: '목표설정방법',
    subtitle: 'Goal-Setting Method',
    description: 'SMART 기준으로 실행 가능한 목표를 직접 만듭니다. AI가 정해주는 게 아니라, 당신이 설계합니다.',
  },
]

const steps = [
  {
    number: '1',
    phase: '자기이해',
    title: '비전 탐색',
    question: '"당신이 원하는 것은 무엇인가요?"',
    desc: '막연해도 괜찮습니다. AI가 질문을 통해 진짜 바람을 끌어냅니다.',
  },
  {
    number: '2',
    phase: '문제 정의',
    title: '현재 상태 분석',
    question: '"지금 현실과 원하는 상태의 차이는 무엇인가요?"',
    desc: '장애물과 갭을 직면하면 목표가 훨씬 구체적이 됩니다.',
  },
  {
    number: '3',
    phase: '자기이해',
    title: '동기 탐색 (5 Whys)',
    question: '"왜 이것이 당신에게 중요한가요?"',
    desc: '"왜"를 반복하며 피상적 목표 뒤에 있는 진짜 에너지를 발견합니다.',
  },
  {
    number: '4',
    phase: '목표설정방법',
    title: '목표 재정의',
    question: '"이 목표를 어떤 형태로 만들고 싶나요?"',
    desc: '지금까지의 탐색을 바탕으로 당신이 직접 목표를 재설계합니다.',
  },
  {
    number: '5',
    phase: '목표설정방법',
    title: 'SMART 목표 완성',
    question: '"언제까지, 어떻게 측정할 건가요?"',
    desc: 'Specific · Measurable · Achievable · Relevant · Time-bound — 당신이 선택한 목표를 완성합니다.',
  },
]

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            AI 목표설정 코치 · Goal Agent Planner
          </div>

          <h1 className={styles.title}>
            목표설정 <span className="text-gradient">능력</span>을<br />
            키우세요
          </h1>

          <p className={styles.subtitle}>
            AI가 답을 대신 알려주지 않습니다.<br />
            <strong>당신이 스스로 발견하도록</strong> 질문합니다.
          </p>

          <div className={styles.pillarsRow}>
            <span className={styles.pillarChip}>🔍 자기이해</span>
            <span className={styles.plus}>+</span>
            <span className={styles.pillarChip}>📌 문제 정의</span>
            <span className={styles.plus}>+</span>
            <span className={styles.pillarChip}>🎯 목표설정방법</span>
          </div>

          <div className={styles.heroCta}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              무료로 시작하기
            </Link>
          </div>

          <p className={styles.heroNote}>
            5분 대화로 SMART 목표 완성 · 무료 ·{' '}
            <Link href="/login" className={styles.loginLink}>이미 계정이 있어요</Link>
          </p>
        </div>

        <div className={styles.heroVisual}>
          <HeroVisual />
        </div>
      </section>

      {/* Pillars Section */}
      <section className={styles.pillars}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>핵심 개념</div>
          <h2 className={styles.sectionTitle}>
            목표설정능력은 3가지로 이루어집니다
          </h2>
          <p className={styles.sectionSubtitle}>
            막연한 바람을 실행 가능한 목표로 만드는 것은 배울 수 있는 능력입니다.
          </p>
        </div>

        <div className={styles.pillarGrid}>
          {pillars.map((p, i) => (
            <div key={i} className={styles.pillarCard}>
              <div className={styles.pillarIcon}>{p.icon}</div>
              <div className={styles.pillarNum}>0{i + 1}</div>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <div className={styles.pillarSubtitle}>{p.subtitle}</div>
              <p className={styles.pillarDesc}>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section className={styles.whySection}>
        <div className={styles.whyCard}>
          <div className={styles.whyIcon}>💡</div>
          <div className={styles.whyContent}>
            <h3>왜 AI가 목표를 직접 정해주지 않나요?</h3>
            <p>
              외부에서 주어진 목표는 지속적인 동기로 이어지지 않습니다.
              자신이 발견하고 직접 설계한 목표만이 진짜 실행력을 만듭니다.
              Goal Agent는 <strong>당신이 스스로 결론에 도달하도록</strong> 안내하는 코치입니다.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>5단계 코칭 프로세스</div>
          <h2 className={styles.sectionTitle}>어떻게 진행되나요?</h2>
          <p className={styles.sectionSubtitle}>
            AI가 한 번에 하나씩 질문합니다. 당신은 생각하고, 답하고, 발견합니다.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepLeft}>
                <div className={styles.stepNumber}>{step.number}</div>
                {i < steps.length - 1 && <div className={styles.stepLine} />}
              </div>
              <div className={styles.stepRight}>
                <div className={styles.stepPhase}>{step.phase}</div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <div className={styles.stepQuestion}>{step.question}</div>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>요금제</div>
          <h2 className={styles.sectionTitle}>무료로 시작, 필요할 때 업그레이드</h2>
          <p className={styles.sectionSubtitle}>
            목표를 발견하는 것은 무료입니다.<br />
            끝까지 실행하고 싶다면 프리미엄으로.
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Free Plan */}
          <div className={styles.pricingCard}>
            <div className={styles.planLabel}>FREE</div>
            <div className={styles.planPrice}>
              <span className={styles.planAmount}>₩0</span>
              <span className={styles.planPeriod}>/ 월</span>
            </div>
            <p className={styles.planDesc}>목표설정 능력을 경험해보세요</p>
            <ul className={styles.planFeatures}>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                AI 코칭 세션 <strong>월 3회</strong>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                SMART 목표 설계
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                5단계 자기이해 프로세스
              </li>
              <li className={`${styles.featureItem} ${styles.featureMuted}`}>
                <span className={styles.featureIconMuted}>✕</span>
                꿈 실현 플래너 (마일스톤·일정)
              </li>
              <li className={`${styles.featureItem} ${styles.featureMuted}`}>
                <span className={styles.featureIconMuted}>✕</span>
                프리미엄 PDF 리포트
              </li>
            </ul>
            <a href="/signup" className={`btn btn-secondary ${styles.planBtn}`}>
              무료로 시작하기
            </a>
          </div>

          {/* Premium Plan */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPremium}`}>
            <div className={styles.planBadge}>추천</div>
            <div className={styles.planLabel}>PREMIUM</div>
            <div className={styles.planPrice}>
              <span className={styles.planAmount}>₩9,900</span>
              <span className={styles.planPeriod}>/ 월</span>
            </div>
            <p className={styles.planDesc}>목표를 끝까지 실행하세요</p>
            <ul className={styles.planFeatures}>
              <li className={styles.featureItem}>
                <span className={styles.featureIconPremium}>✓</span>
                AI 코칭 세션 <strong>무제한</strong>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconPremium}>✓</span>
                SMART 목표 설계
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconPremium}>✓</span>
                5단계 자기이해 프로세스
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconPremium}>✓</span>
                꿈 실현 플래너 (마일스톤·일정)
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconPremium}>✓</span>
                프리미엄 PDF 리포트
              </li>
            </ul>
            <a href="/signup" className={`btn btn-primary ${styles.planBtn}`}>
              프리미엄 시작하기
            </a>
            <p className={styles.planNote}>첫 7일 무료 체험</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>지금 바로 탐색을 시작하세요</h2>
          <p>5분의 대화로 당신만의 SMART 목표가 완성됩니다</p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            무료로 시작하기
          </Link>
          <p className={styles.ctaNote}>회원가입 후 바로 시작 · 무료</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Kingcle Expansion OS · Goal Agent Planner</p>
        <div className={styles.footerLinks}>
          <AdminDemoButton />
          <Link href="/signup">무료 회원가입</Link>
          <Link href="/login">로그인</Link>
        </div>
      </footer>
    </main>
  )
}
