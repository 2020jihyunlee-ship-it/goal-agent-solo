'use client'

import { useState } from 'react'

export default function AdminDemoButton() {
    const [show, setShow] = useState(false)
    const [pw, setPw] = useState('')
    const [error, setError] = useState('')

    const close = () => { setShow(false); setPw(''); setError('') }

    const handleAccess = () => {
        if (pw === 'kingclcoach1234') {
            window.location.href = '/planner/a1b2c3d4-0000-0000-0000-000000000001'
        } else {
            setError('비밀번호가 올바르지 않습니다')
        }
    }

    return (
        <>
            <button
                onClick={() => setShow(true)}
                style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
                }}
            >
                관리자 데모
            </button>

            {show && (
                <div
                    onClick={close}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#13131f',
                            border: '1px solid rgba(139,92,246,0.35)',
                            borderRadius: '16px',
                            padding: '32px',
                            width: '340px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            boxShadow: '0 0 40px rgba(139,92,246,0.15)',
                        }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                            관리자 데모 플래너
                        </h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                            관리자 비밀번호를 입력하세요
                        </p>
                        <input
                            type="password"
                            value={pw}
                            onChange={e => { setPw(e.target.value); setError('') }}
                            onKeyDown={e => e.key === 'Enter' && handleAccess()}
                            placeholder="비밀번호"
                            autoFocus
                            style={{
                                padding: '10px 14px',
                                fontSize: '14px',
                                color: '#fff',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                outline: 'none',
                            }}
                        />
                        {error && (
                            <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={close}
                                style={{
                                    padding: '8px 16px', fontSize: '13px',
                                    color: 'rgba(255,255,255,0.5)',
                                    background: 'none',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '8px', cursor: 'pointer',
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAccess}
                                style={{
                                    padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                                    color: '#fff',
                                    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                }}
                            >
                                입장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
