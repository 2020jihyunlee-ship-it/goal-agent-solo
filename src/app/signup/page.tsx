'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/page.module.css'

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.logo}>
                            🎯 목표설정 에이전트
                        </Link>
                    </div>

                    <div className={`card ${styles.formCard}`}>
                        <h1 className={styles.title}>가입 완료!</h1>
                        <p className={styles.subtitle}>
                            이메일을 확인하여 계정을 활성화해주세요.
                        </p>
                        <Link href="/login" className="btn btn-primary w-full">
                            로그인 하러 가기
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
                    <Link href="/" className={styles.logo}>
                        🎯 목표설정 에이전트
                    </Link>
                </div>

                <div className={`card ${styles.formCard}`}>
                    <h1 className={styles.title}>회원가입</h1>
                    <p className={styles.subtitle}>목표 설정 여정을 시작하세요</p>

                    <form onSubmit={handleSignup} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="name" className="input-label">
                                이름
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="input"
                                placeholder="홍길동"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email" className="input-label">
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password" className="input-label">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="8자 이상"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${styles.submitBtn}`}
                            disabled={loading}
                        >
                            {loading ? '가입 중...' : '가입하기'}
                        </button>
                    </form>

                    <div className={styles.formFooter}>
                        이미 계정이 있으신가요?{' '}
                        <Link href="/login" className={styles.link}>
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
