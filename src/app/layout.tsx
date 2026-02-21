import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goal Agent | AI 목표설정 코치",
  description: "자기이해 · 문제 정의 · 목표설정방법 — 3단계 목표설정능력을 키우는 AI 코칭. 에이전트가 답을 주지 않습니다. 당신이 스스로 발견하도록 질문합니다.",
  keywords: ["목표설정", "AI 코치", "SMART 목표", "자기이해", "문제 정의", "목표설정능력", "Kingcle"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
