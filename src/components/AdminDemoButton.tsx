'use client'

import { useState } from 'react'

export default function AdminDemoButton() {
    const [show, setShow] = useState(false)
    const [pw, setPw] = useState('')
    const [error, setError] = useState('')
    const [unlocked, setUnlocked] = useState(false)

    const close = () => { setShow(false); setPw(''); setError(''); setUnlocked(false) }

    const handleAccess = () => {
        if (pw === 'kingclcoach1234') {
            setUnlocked(true)
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
                            width: '360px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            boxShadow: '0 0 40px rgba(139,92,246,0.15)',
                        }}
                    >
                        {!unlocked ? (
                            <>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                                    관리자 데모
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
                                        확인
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>✅</div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                                        관리자 데모 — 둘 중 선택하세요
                                    </h3>
                                </div>
                                <button
                                    onClick={() => { window.location.href = '/planner/a1b2c3d4-0000-0000-0000-000000000001' }}
                                    style={{
                                        padding: '16px 20px',
                                        fontSize: '14px', fontWeight: 600,
                                        color: '#fff',
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.15))',
                                        border: '1px solid rgba(139,92,246,0.4)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>📋</span>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>꿈 실현 플래너</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>마일스톤 · 주간목표 · 실행로그</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { window.location.href = '/pdf-preview' }}
                                    style={{
                                        padding: '16px 20px',
                                        fontSize: '14px', fontWeight: 600,
                                        color: '#fff',
                                        background: 'linear-gradient(135deg, rgba(109,40,217,0.25), rgba(30,58,95,0.25))',
                                        border: '1px solid rgba(109,40,217,0.4)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>📄</span>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>프리미엄 PDF 리포트</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>목표설정 분석 · 동기 · 코칭 멘트</div>
                                    </div>
                                </button>
                                <button
                                    onClick={close}
                                    style={{
                                        padding: '8px', fontSize: '12px',
                                        color: 'rgba(255,255,255,0.35)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        textAlign: 'center',
                                    }}
                                >
                                    닫기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
