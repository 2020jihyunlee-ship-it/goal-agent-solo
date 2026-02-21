'use client'

interface PdfOptions {
    filename?: string
    elementId?: string
}

export async function downloadPdf(options: PdfOptions = {}) {
    const {
        filename = '목표설정_리포트.pdf',
        elementId = 'pdf-content'
    } = options

    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
        console.error('downloadPdf can only be used in browser')
        return
    }

    const element = document.getElementById(elementId)

    if (!element) {
        console.error(`Element with id "${elementId}" not found`)
        return
    }

    try {
        // Dynamic import to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default

        const opt = {
            margin: [10, 10, 10, 10] as [number, number, number, number],
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: {
                unit: 'mm' as const,
                format: 'a4' as const,
                orientation: 'portrait' as const
            },
            pagebreak: { mode: 'avoid-all' as const }
        }

        await html2pdf().set(opt).from(element).save()
    } catch (error) {
        console.error('PDF generation failed:', error)
        // Fallback to print
        window.print()
    }
}

export default downloadPdf
