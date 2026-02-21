'use client'

import React from 'react'
import styles from './CompetencyRadar.module.css'

interface CompetencyData {
    label: string
    value: number
}

interface CompetencyRadarProps {
    data: CompetencyData[]
    size?: number
}

export default function CompetencyRadar({ data, size = 300 }: CompetencyRadarProps) {
    const padding = 60
    const center = size / 2
    const radius = center - padding
    const angleStep = (Math.PI * 2) / data.length

    // Generate coordinates for the background levels (hexagons/quads)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0]
    const levelPaths = levels.map(level => {
        return data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2
            const x = center + radius * level * Math.cos(angle)
            const y = center + radius * level * Math.sin(angle)
            return `${x},${y}`
        }).join(' ')
    })

    // Generate coordinates for the actual data polygon
    const dataPoints = data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2
        const valueNormalized = d.value / 100
        const x = center + radius * valueNormalized * Math.cos(angle)
        const y = center + radius * valueNormalized * Math.sin(angle)
        return { x, y }
    })
    const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

    return (
        <div className={styles.container} style={{ width: size, height: size }}>
            <svg width={size} height={size} className={styles.svg}>
                {/* Background Grids */}
                {levelPaths.map((path, i) => (
                    <polygon key={i} points={path} className={styles.gridLine} />
                ))}

                {/* Axes */}
                {data.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    const x = center + radius * Math.cos(angle)
                    const y = center + radius * Math.sin(angle)
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            className={styles.axis}
                        />
                    )
                })}

                {/* Data Polygon */}
                <polygon points={dataPath} className={styles.dataArea} />

                {/* Data Points */}
                {dataPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={4} className={styles.dataPoint} />
                ))}

                {/* Labels */}
                {data.map((d, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    const labelRadius = radius + 25
                    const x = center + labelRadius * Math.cos(angle)
                    const y = center + labelRadius * Math.sin(angle)

                    // Adjust text alignment based on position
                    const textAnchor = Math.abs(x - center) < 10 ? 'middle' : x > center ? 'start' : 'end'

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            className={styles.label}
                            dy="0.35em"
                        >
                            {d.label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}
