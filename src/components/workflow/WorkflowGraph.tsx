'use client'

import { useCallback } from 'react'
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MarkerType,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Step, NodeStatus } from '@/types'
import styles from './WorkflowGraph.module.css'

interface WorkflowGraphProps {
    currentStep: Step
    completedSteps: Step[]
    compact?: boolean
}

const stepConfig: { id: Step; label: string; icon: string }[] = [
    { id: 'input', label: '입력', icon: '🎯' },
    { id: 'problem_definition', label: '정의', icon: '🔍' },
    { id: 'why_analysis', label: '분석', icon: '❓' },
    { id: 'redefinition', label: '재정의', icon: '🔄' },
    { id: 'smart_goal', label: '완성', icon: '✅' },
]

function getNodeStatus(step: Step, currentStep: Step, completedSteps: Step[]): NodeStatus {
    if (completedSteps.includes(step)) return 'completed'
    if (step === currentStep) return 'current'
    return 'pending'
}

function getStatusColor(status: NodeStatus): string {
    switch (status) {
        case 'completed':
            return '#22c55e'
        case 'current':
            return '#7df9ff'
        default:
            return '#3f3f46'
    }
}

export default function WorkflowGraph({ currentStep, completedSteps, compact = false }: WorkflowGraphProps) {
    const nodes: Node[] = stepConfig.map((step, index) => {
        const status = getNodeStatus(step.id, currentStep, completedSteps)
        const isCurrent = status === 'current'
        const isCompleted = status === 'completed'

        const horizontalX = index * 160 + 50
        const verticalY = index * 130 + 50

        return {
            id: step.id,
            position: { x: compact ? horizontalX : 60, y: compact ? 30 : verticalY },
            data: {
                label: (
                    <div className={`${styles.nodeContent} ${isCurrent ? styles.active : ''}`}>
                        <div className={styles.nodeIconWrapper}>
                            <span className={styles.nodeIcon}>{step.icon}</span>
                        </div>
                        {!compact && (
                            <div className={styles.labelGroup}>
                                <span className={styles.nodeLabel}>{step.label}</span>
                                {isCurrent && <span className={styles.activePulse}>ANALYZING...</span>}
                            </div>
                        )}
                    </div>
                ),
            },
            style: {
                background: isCurrent
                    ? 'rgba(125, 249, 255, 0.05)'
                    : isCompleted
                        ? 'rgba(34, 197, 94, 0.05)'
                        : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                    ? '2px solid #7df9ff'
                    : isCompleted
                        ? '2px solid #22c55e'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '0',
                color: '#fff',
                minWidth: compact ? '60px' : '220px',
                height: compact ? '60px' : '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 0 30px rgba(125, 249, 255, 0.2)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            sourcePosition: compact ? Position.Right : Position.Bottom,
            targetPosition: compact ? Position.Left : Position.Top,
        }
    })

    const edges: Edge[] = stepConfig.slice(0, -1).map((step, index) => {
        const sourceStatus = getNodeStatus(step.id, currentStep, completedSteps)
        const isCompleted = sourceStatus === 'completed'
        const isNextCurrent = stepConfig[index + 1].id === currentStep

        return {
            id: `${step.id}-${stepConfig[index + 1].id}`,
            source: step.id,
            target: stepConfig[index + 1].id,
            style: {
                stroke: isCompleted ? '#22c55e' : isNextCurrent ? '#7df9ff' : 'rgba(255, 255, 255, 0.1)',
                strokeWidth: isCompleted || isNextCurrent ? 3 : 1,
            },
            animated: isNextCurrent,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isCompleted ? '#22c55e' : isNextCurrent ? '#7df9ff' : 'rgba(255, 255, 255, 0.1)',
            },
        }
    })

    const onInit = useCallback((instance: any) => {
        instance.fitView({ padding: 0.2 })
    }, [])

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            <div className={styles.graphWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onInit={onInit}
                    fitView
                    attributionPosition="bottom-left"
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    zoomOnScroll={false}
                    panOnScroll={false}
                    panOnDrag={false}
                >
                    <Background color="#1a1a2e" gap={20} size={1} />
                </ReactFlow>
            </div>
        </div>
    )
}
