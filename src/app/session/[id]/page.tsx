'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionRedirectPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    useEffect(() => { router.replace(`/planner/${params.id}`) }, [params.id, router])
    return (
        <div style={{
            display: 'flex', height: '100vh', alignItems: 'center',
            justifyContent: 'center', color: 'var(--color-text-muted)',
            background: 'var(--color-bg-primary)'
        }}>
            리다이렉트 중...
        </div>
    )
}
