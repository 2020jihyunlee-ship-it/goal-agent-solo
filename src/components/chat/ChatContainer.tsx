'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Message } from '@/types'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import styles from './ChatContainer.module.css'

interface ChatContainerProps {
    messages: Message[]
    onSendMessage: (message: string) => void
    isLoading: boolean
}

export default function ChatContainer({ messages, onSendMessage, isLoading }: ChatContainerProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 새 메시지가 오면 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.coachBrand}>
                    <div className={styles.coachAvatarMini}>
                        <Image
                            src="/goal-coach.png"
                            alt="Goal AI Coach"
                            width={32}
                            height={32}
                            priority
                        />
                    </div>
                    <div className={styles.brandText}>
                        <h3 className={styles.title}>Goal Agent</h3>
                        <span className={styles.subtitle}>Kingcle Expansion OS</span>
                    </div>
                </div>
                <span className={styles.status}>
                    <span className={styles.statusDot}></span>
                    {isLoading ? '분석 중...' : '온라인'}
                </span>
            </div>

            <div className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.welcome}>
                        <div className={styles.welcomeCoach}>
                            <Image
                                src="/goal-coach.png"
                                alt="Goal AI Coach"
                                width={120}
                                height={120}
                                priority
                            />
                        </div>
                        <h4>환영합니다</h4>
                        <p>
                            저는 당신의 목표설정을 돕는 전문 코치입니다.
                            달성하고 싶은 목표를 편하게 말씀해주세요.
                            함께 체계적으로 정리해 나가겠습니다.
                        </p>
                    </div>
                )}

                {messages.map((message, idx) => (
                    <ChatMessage key={message.id || idx} message={message} />
                ))}

                {isLoading && (
                    <div className={styles.typing}>
                        <span className={styles.typingLabel}>코치가 분석 중</span>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                onSend={onSendMessage}
                disabled={isLoading}
                placeholder={messages.length === 0 ? '달성하고 싶은 목표를 말씀해주세요...' : '코치에게 답변해주세요...'}
            />
        </div>
    )
}
