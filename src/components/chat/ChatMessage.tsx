'use client'

import { Message } from '@/types'
import Image from 'next/image'
import styles from './ChatMessage.module.css'

interface ChatMessageProps {
    message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user'

    return (
        <div className={`${styles.messageWrapper} ${isUser ? styles.user : styles.assistant}`}>
            <div className={styles.avatar}>
                {isUser ? '👤' : (
                    <Image
                        src="/goal-coach.png"
                        alt="Coach"
                        width={40}
                        height={40}
                        className={styles.coachImg}
                    />
                )}
            </div>
            <div className={styles.content}>
                <div className={styles.bubble}>
                    {message.content.split('\n').map((line, idx) => (
                        <p key={idx} className={styles.line}>
                            {line || '\u00A0'}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}
