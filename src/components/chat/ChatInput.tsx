'use client'

import { useState, KeyboardEvent } from 'react'
import styles from './ChatInput.module.css'

interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
    placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder = '메시지를 입력하세요...' }: ChatInputProps) {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (!message.trim() || disabled) return
        onSend(message.trim())
        setMessage('')
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={styles.container}>
            <textarea
                className={styles.input}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
            />
            <button
                className={styles.sendButton}
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                aria-label="전송"
            >
                {disabled ? (
                    <span className={styles.loading}>⏳</span>
                ) : (
                    <span>➤</span>
                )}
            </button>
        </div>
    )
}
