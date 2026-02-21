'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionNewRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/agents/goal')
    }, [router])

    return null
}
