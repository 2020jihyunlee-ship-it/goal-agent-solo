import Link from 'next/link'
import styles from './AgentNavigator.module.css'

interface AgentNavigatorProps {
    currentStep: 'goal' | 'strategy' | 'time' | 'action' | 'review' | 'manager-g'
}

const steps = [
    { id: 'goal', name: 'Goal', icon: '🎯', href: '/agents/goal' },
    { id: 'strategy', name: 'Strategy', icon: '📊', href: '/agents/strategy' },
    { id: 'time', name: 'Time', icon: '⏰', href: '/agents/time' },
    { id: 'action', name: 'Action', icon: '⚡', href: '/agents/action' },
    { id: 'review', name: 'Review', icon: '📝', href: '/agents/review' },
    { id: 'manager-g', name: 'Manager G', icon: '🧥', href: '/agents/manager-g' },
]

export default function AgentNavigator({ currentStep }: AgentNavigatorProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStep)

    return (
        <nav className={styles.navigator}>
            <div className={styles.container}>
                {steps.map((step, idx) => {
                    const isActive = step.id === currentStep
                    const isCompleted = idx < currentIndex
                    const isLocked = idx > currentIndex && step.id !== 'goal'

                    return (
                        <div key={step.id} className={styles.stepWrapper}>
                            <Link
                                href={step.href}
                                className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''} ${isLocked ? styles.locked : ''}`}
                            >
                                <span className={styles.icon}>{step.icon}</span>
                                <span className={styles.name}>{step.name}</span>
                                {isCompleted && <span className={styles.check}>✓</span>}
                            </Link>
                            {idx < steps.length - 1 && (
                                <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />
                            )}
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}
