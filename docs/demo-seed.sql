-- ============================================================
-- Goal Agent Planner — 관리자 데모 데이터 시딩
-- Supabase Dashboard > SQL Editor 에서 실행
-- ============================================================

-- STEP 1: 본인의 user_id를 먼저 확인하세요
-- SELECT id, email FROM auth.users;

-- STEP 2: 아래 do $$ 블록의 'YOUR_ADMIN_EMAIL@example.com' 을
--         실제 관리자 이메일로 교체 후 전체 실행

DO $$
DECLARE
  demo_user_id    uuid;
  demo_session_id uuid := 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
BEGIN

  -- 관리자 이메일로 user_id 자동 조회
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION '해당 이메일의 사용자를 찾을 수 없습니다. 이메일을 확인하세요.';
  END IF;

  -- --------------------------------------------------------
  -- 기존 데모 데이터 정리 (재실행 시 중복 방지)
  -- --------------------------------------------------------
  DELETE FROM planner_weekly_tasks  WHERE session_id = demo_session_id;
  DELETE FROM planner_weekly_goals  WHERE session_id = demo_session_id;
  DELETE FROM planner_logs          WHERE session_id = demo_session_id;
  DELETE FROM planner_milestones    WHERE session_id = demo_session_id;
  DELETE FROM final_goals           WHERE session_id = demo_session_id;
  DELETE FROM goal_sessions         WHERE id = demo_session_id;

  -- --------------------------------------------------------
  -- 1. goal_sessions
  -- --------------------------------------------------------
  INSERT INTO goal_sessions (id, user_id, status, original_goal, completed_at)
  VALUES (
    demo_session_id,
    demo_user_id,
    'completed',
    '온라인 코칭 비즈니스를 시작해서 월 매출 500만원을 달성하고 싶어요',
    now() - interval '3 days'
  );

  -- --------------------------------------------------------
  -- 2. final_goals
  -- --------------------------------------------------------
  INSERT INTO final_goals (
    session_id, original_goal, root_cause,
    smart_specific, smart_measurable, smart_achievable,
    smart_relevant, smart_time_bound, summary,
    score_total, score_problem_definition, score_self_awareness,
    score_specificity, score_action_planning, analysis,
    intrinsic_motivation, extrinsic_motivation, coaching_message
  ) VALUES (
    demo_session_id,
    '온라인 코칭 비즈니스를 시작해서 월 매출 500만원을 달성하고 싶어요',
    '회사 생활의 한계를 벗어나 자신이 가진 경험과 지식으로 직접 가치를 만들고 싶다는 욕구',
    '목표설정 코칭 프로그램을 설계하고 첫 유료 고객 5명을 확보한다',
    '유료 고객 수(명), 월 매출(원)으로 측정',
    '직장 경력 7년 + 코칭 자격증 보유로 충분한 역량 확인됨',
    '자아실현과 경제적 자유 두 가지 욕구 모두를 충족시키는 목표',
    '2026-12-31',
    '1년 내 온라인 코칭 비즈니스 구축 — 목표설정 전문 코치로 월 매출 500만원 달성',
    82, 78, 88, 85, 77,
    '{"strengths": ["7년 경력 기반 전문성", "목표설정 프레임워크 이해", "자기이해 높음"], "improvements": ["초기 고객 유치 전략 구체화 필요", "가격 정책 설정 필요"], "next_steps": ["첫 무료 세션 3회 운영으로 후기 확보", "SNS 콘텐츠 20개 발행", "유료 프로그램 설계"]}',
    '자신이 겪어온 방황과 목표 없이 살던 시기를 돌아봤을 때, 그 경험을 나누며 다른 사람의 삶을 바꾸는 코치가 되는 것이 진정한 사명감으로 느껴집니다. 단순한 수익보다 의미 있는 일을 하고 싶다는 내면의 소망이 이 목표의 핵심 에너지입니다.',
    '경제적 자유와 회사에 종속되지 않는 삶에 대한 갈망이 강한 동기입니다. 월 500만원은 직장 월급을 대체할 수 있는 현실적 기준이며, 이를 달성하면 완전한 독립이 가능해집니다.',
    '당신은 이미 충분한 경험과 지식을 갖고 있습니다. 부족한 것은 역량이 아니라 "시작하는 용기"입니다. 완벽한 준비를 기다리지 말고, 작은 행동부터 시작하세요. 첫 번째 무료 세션이 당신의 비즈니스를 바꿀 것입니다. 12개월 후 돌아볼 때, 오늘 이 결정이 가장 중요한 순간이었다는 것을 알게 될 것입니다.'
  );

  -- --------------------------------------------------------
  -- 3. planner_milestones (6개)
  -- --------------------------------------------------------
  INSERT INTO planner_milestones (session_id, title, due_date, is_completed, order_index) VALUES
    (demo_session_id, '코칭 프로그램 커리큘럼 설계 완료', '2026-03-31', true,  0),
    (demo_session_id, '무료 세션 3회 운영 & 후기 3개 확보', '2026-04-30', true,  1),
    (demo_session_id, '첫 유료 고객 5명 달성 (월 150만원)', '2026-06-30', false, 2),
    (demo_session_id, 'SNS 팔로워 1,000명 & 콘텐츠 50개 발행', '2026-08-31', false, 3),
    (demo_session_id, '월 매출 300만원 돌파 (그룹 프로그램 런칭)', '2026-10-31', false, 4),
    (demo_session_id, '월 매출 500만원 달성 — 목표 완성!', '2026-12-31', false, 5);

  -- --------------------------------------------------------
  -- 4. planner_logs (5개)
  -- --------------------------------------------------------
  INSERT INTO planner_logs (session_id, content, log_date) VALUES
    (demo_session_id, '오늘 드디어 코칭 커리큘럼 1차 초안 완성. 5단계 자기이해 프로세스를 핵심으로 잡기로 했다. 생각보다 잘 정리됐다.',
     current_date - interval '18 days'),
    (demo_session_id, '지인 소개로 첫 번째 무료 세션 진행. 클라이언트가 "이런 대화가 필요했어요"라고 해줬다. 자신감이 생겼다.',
     current_date - interval '12 days'),
    (demo_session_id, '두 번째, 세 번째 무료 세션 완료. 후기 3개 받았고 모두 긍정적이었다. 유료 전환에 대한 의향도 1명이 밝혔다.',
     current_date - interval '7 days'),
    (demo_session_id, '첫 번째 마일스톤 완료! 커리큘럼 최종본 완성. 이제 유료 런칭 준비 단계다. SNS 콘텐츠 10개 예약 발행 완료.',
     current_date - interval '3 days'),
    (demo_session_id, '오늘 첫 유료 고객이 결제했다. 30만원 프로그램. 생애 첫 코칭 수익이다. 앞으로 5명만 더 모으면 된다.',
     current_date - interval '1 day');

  -- --------------------------------------------------------
  -- 5. planner_weekly_goals (이번 주)
  -- --------------------------------------------------------
  INSERT INTO planner_weekly_goals (session_id, week_start, goal_text)
  VALUES (
    demo_session_id,
    date_trunc('week', current_date)::date,
    '유료 전환 가능성 있는 무료 세션 참가자 2명에게 제안 연락하기 + SNS 게시물 3개 발행'
  );

  -- --------------------------------------------------------
  -- 6. planner_weekly_tasks (오늘 기준 3개)
  -- --------------------------------------------------------
  INSERT INTO planner_weekly_tasks (session_id, task_date, week_start, title, is_completed, order_index, start_time, end_time)
  VALUES
    (demo_session_id, current_date,
     date_trunc('week', current_date)::date,
     '잠재 고객 A에게 유료 제안 DM 발송', true, 0, '09:00', '09:30'),
    (demo_session_id, current_date,
     date_trunc('week', current_date)::date,
     '인스타그램 코칭 후기 게시물 작성', false, 1, '14:00', '15:00'),
    (demo_session_id, current_date,
     date_trunc('week', current_date)::date,
     '2번째 유료 고객 온보딩 준비 (자료 정리)', false, 2, '20:00', '21:00');

  RAISE NOTICE '✅ 데모 데이터 시딩 완료! user_id: %', demo_user_id;
END $$;
