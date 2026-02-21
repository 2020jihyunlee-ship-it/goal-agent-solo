'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/page.module.css'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [done, setDone] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsReady(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirm) {
            setError('비밀번호가 일치하지 않습니다')
            return
        }
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setDone(true)
            setTimeout(() => router.push('/agents/goal'), 1500)
        }
    }

    if (done) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.logo}>🎯 목표설정 에이전트</Link>
                    </div>
                    <div className={`card ${styles.formCard}`}>
                        <p style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
                        <h1 className={styles.title}>변경 완료!</h1>
                        <p className={styles.subtitle}>새 비밀번호로 변경되었습니다.<br />잠시 후 목표 설정으로 이동합니다.</p>
                    </div>
                </div>
            </main>
        )
    }

    if (!isReady) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.logo}>🎯 목표설정 에이전트</Link>
                    </div>
                    <div className={`card ${styles.formCard}`}>
                        <h1 className={styles.title}>링크를 확인 중...</h1>
                        <p className={styles.subtitle}>이메일의 재설정 링크를 통해 접속해주세요.</p>
                        <Link href="/forgot-password" className="btn btn-secondary w-full">
                            재설정 링크 다시 받기
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>🎯 목표설정 에이전트</Link>
                </div>
                <div className={`card ${styles.formCard}`}>
                    <h1 className={styles.title}>새 비밀번호 설정</h1>
                    <p className={styles.subtitle}>새로운 비밀번호를 입력해주세요</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className="input-group">
                            <label htmlFor="password" className="input-label">새 비밀번호</label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="8자 이상"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirm" className="input-label">비밀번호 확인</label>
                            <input
                                id="confirm"
                                type="password"
                                className="input"
                                placeholder="동일하게 입력"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${styles.submitBtn}`}
                            disabled={loading}
                        >
                            {loading ? '변경 중...' : '비밀번호 변경하기'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
