import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goal Agent Planner | AI 목표설정 + 실행 플래너",
  description: "AI 코치와 대화로 SMART 목표를 설계하고, 마일스톤 · 주간목표 · 일일 스케줄로 끝까지 실행합니다. 답을 주지 않고 당신이 스스로 발견하도록 질문합니다.",
  keywords: ["목표설정", "AI 코치", "SMART 목표", "플래너", "실행", "자기이해", "Goal Agent Planner", "Kingcle"],
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
