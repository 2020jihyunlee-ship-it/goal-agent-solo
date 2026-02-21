'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/page.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setSent(true)
        }
        setLoading(false)
    }

    if (sent) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.logo}>🎯 목표설정 에이전트</Link>
                    </div>
                    <div className={`card ${styles.formCard}`}>
                        <p style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem' }}>📬</p>
                        <h1 className={styles.title}>이메일을 확인하세요</h1>
                        <p className={styles.subtitle}>
                            <strong>{email}</strong>로<br />
                            비밀번호 재설정 링크를 보냈습니다.<br />
                            이메일의 링크를 클릭하면 새 비밀번호를 설정할 수 있습니다.
                        </p>
                        <Link href="/login" className="btn btn-secondary w-full">
                            로그인으로 돌아가기
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
                    <h1 className={styles.title}>비밀번호 찾기</h1>
                    <p className={styles.subtitle}>가입한 이메일을 입력하면 재설정 링크를 보내드립니다</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className="input-group">
                            <label htmlFor="email" className="input-label">이메일</label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${styles.submitBtn}`}
                            disabled={loading}
                        >
                            {loading ? '전송 중...' : '재설정 링크 보내기'}
                        </button>
                    </form>

                    <div className={styles.formFooter}>
                        <Link href="/login" className={styles.link}>← 로그인으로 돌아가기</Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
