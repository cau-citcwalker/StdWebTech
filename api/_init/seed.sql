-- =============================================================
-- FinEdu — 시드 데이터
--
-- phpMyAdmin 에서 schema.sql 실행 후 이 파일을 실행한다.
-- 단원 / 레슨 / 문제를 채워 학습공간이 첫 방문에도 의미있게 보이도록.
-- =============================================================

SET NAMES utf8mb4;

INSERT INTO units (slug, title, subtitle, sort_order, color) VALUES
  ('basics',  '주식 기초', '주식·증권의 가장 기본 개념을 익혀요.', 1, '#58cc02'),
  ('market',  '시장과 가격', '수요·공급과 시장 메커니즘.',        2, '#1cb0f6'),
  ('alloc',   '자산 배분',   '돈을 어디에 얼마나 둘 것인가.',       3, '#ffc800'),
  ('macro',   '거시 흐름',   '금리·물가·환율이 자산에 미치는 영향.', 4, '#ce82ff');

-- ----- Unit: basics ------------------------------------------------
INSERT INTO lessons (unit_id, slug, title, summary, icon, sort_order, xp_reward) VALUES
  ((SELECT id FROM units WHERE slug='basics'), 'what-is-stock',     '주식이란 무엇인가요?',     '회사의 소유권을 잘게 나눈 증권.', 'spark', 1, 15),
  ((SELECT id FROM units WHERE slug='basics'), 'stock-vs-bond',     '주식과 채권의 차이',       '소유권 vs 빚.',                   'compare', 2, 15),
  ((SELECT id FROM units WHERE slug='basics'), 'buy-and-sell',      '매수와 매도',              '거래의 두 방향.',                 'arrows', 3, 15),
  ((SELECT id FROM units WHERE slug='basics'), 'dividend',          '배당이 뭔가요?',           '이익의 일부를 주주에게.',         'coin', 4, 20);

-- ----- Unit: market ------------------------------------------------
INSERT INTO lessons (unit_id, slug, title, summary, icon, sort_order, xp_reward) VALUES
  ((SELECT id FROM units WHERE slug='market'), 'price-discovery',   '가격은 어떻게 정해지나요?', '수요와 공급의 만남.',             'chart', 1, 15),
  ((SELECT id FROM units WHERE slug='market'), 'volatility-basic',  '변동성이란?',              '가격이 출렁이는 폭.',             'wave', 2, 15),
  ((SELECT id FROM units WHERE slug='market'), 'order-types',       '주문 종류 (시장가/지정가)',  '두 가지 가장 기본 주문.',         'order', 3, 20);

-- ----- Unit: alloc -------------------------------------------------
INSERT INTO lessons (unit_id, slug, title, summary, icon, sort_order, xp_reward) VALUES
  ((SELECT id FROM units WHERE slug='alloc'),  'what-is-alloc',     '자산 배분이란?',           '한 바구니에 담지 않기.',          'pie', 1, 20),
  ((SELECT id FROM units WHERE slug='alloc'),  'risk-return',       '위험과 수익',              '같이 가는 한 쌍.',                'balance', 2, 20);

-- ----- Unit: macro -------------------------------------------------
INSERT INTO lessons (unit_id, slug, title, summary, icon, sort_order, xp_reward) VALUES
  ((SELECT id FROM units WHERE slug='macro'),  'interest-rate',     '금리가 오르면?',           '돈의 가격이 변하면 자산도 흔들려요.', 'rate', 1, 25);

-- =============================================================
-- 문제 (questions)
--   type: multiple_choice  options: JSON 배열,   answer: 인덱스 문자열
--   type: true_false                              answer: 'true' | 'false'
--   type: fill_blank                              answer: 정답 문자열 (대소문자 무시)
-- =============================================================

-- Lesson: 주식이란?
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='basics' AND l.slug='what-is-stock');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '다음 중 “주식”에 가장 가까운 설명은?',
   '["회사의 빚을 의미하는 증권","회사의 소유권을 일부 갖는 증권","정부가 발행하는 채무 증서","은행 예금의 한 종류"]',
   '1', '주식은 회사의 자기자본을 잘게 나눈 “소유권 조각”입니다.', 1),
  (@lid, 'true_false', '주식을 사면 그 회사의 채권자가 됩니다.',
   NULL, 'false', '채권자가 되는 것은 “채권” 매수이고, 주식 매수는 “주주(소유자)”가 되는 것입니다.', 2),
  (@lid, 'multiple_choice', '주식을 매수했을 때 얻을 수 있는 “두 가지” 대표적 수익은?',
   '["이자와 환차익","배당과 시세차익","월급과 보너스","임대료와 매각차익"]',
   '1', '배당(이익 분배) 과 시세차익(쌀 때 사서 비쌀 때 팔기) 입니다.', 3);

-- Lesson: 주식과 채권의 차이
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='basics' AND l.slug='stock-vs-bond');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '주식과 채권의 가장 큰 차이는?',
   '["발행 회사의 크기","소유권 vs 빚","발행 통화","상장 여부"]',
   '1', '주식은 “소유권 일부”, 채권은 “빚 문서”입니다.', 1),
  (@lid, 'true_false', '회사가 망했을 때 일반적으로 채권자보다 주주가 먼저 변제받는다.',
   NULL, 'false', '청산 시 채권자(빚) → 주주(소유) 순서로 변제됩니다.', 2);

-- Lesson: 매수와 매도
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='basics' AND l.slug='buy-and-sell');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '“매수” 의 정의로 가장 적절한 것은?',
   '["가지고 있던 주식을 시장에 파는 행위","사고 싶은 주식을 시장에서 사는 행위","주문을 취소하는 행위","배당을 받는 행위"]',
   '1', '매수 = Buy, 매도 = Sell.', 1),
  (@lid, 'fill_blank', '가지고 있던 주식을 시장에 “파는” 행위는?  (한 단어)',
   NULL, '매도', '매도(Sell) 라고 합니다.', 2);

-- Lesson: 배당
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='basics' AND l.slug='dividend');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '배당의 일반적인 재원은 어디서 나오나요?',
   '["회사의 빚","회사의 누적된 이익","주주들의 자발적 기부","정부 보조금"]',
   '1', '회사가 번 이익(이익잉여금) 의 일부를 주주에게 나눠줍니다.', 1),
  (@lid, 'true_false', '모든 회사는 매년 반드시 배당을 지급해야 한다.',
   NULL, 'false', '배당은 의무가 아닌 결정 사항입니다. 성장기 회사는 배당 대신 재투자하기도 합니다.', 2);

-- Lesson: 가격 발견
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='market' AND l.slug='price-discovery');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '시장에서 주식 가격은 일반적으로 어떻게 결정되나요?',
   '["회사의 사장님이 정함","수요와 공급의 균형점","정부가 매일 고시","은행이 결정"]',
   '1', '시장 가격은 사겠다는 사람(수요)와 팔겠다는 사람(공급)의 균형점에서 결정됩니다.', 1),
  (@lid, 'true_false', '같은 회사라도 매수세가 강하면 가격이 오를 수 있다.',
   NULL, 'true', '수요가 공급보다 많으면 가격이 오르는 것이 시장의 기본 원리입니다.', 2);

-- Lesson: 변동성
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='market' AND l.slug='volatility-basic');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '“변동성이 크다” 의 의미로 가장 옳은 것은?',
   '["가격이 거의 변하지 않는다","가격이 위아래로 크게 흔들린다","거래량이 늘 일정하다","항상 오른다"]',
   '1', '변동성(Volatility) 은 가격이 출렁이는 폭입니다. 클수록 위아래로 많이 움직입니다.', 1);

-- Lesson: 주문 종류
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='market' AND l.slug='order-types');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '“지정가 주문” 의 특징은?',
   '["내가 정한 가격(또는 더 유리한 가격) 으로만 체결","즉시 가장 좋은 가격에 체결","장 마감 후에만 가능","무조건 가장 비싼 가격에 체결"]',
   '0', '지정가는 “이 가격(또는 더 유리한 가격) 으로만 거래해 주세요” 라고 알려주는 주문입니다.', 1),
  (@lid, 'fill_blank', '현재 시장의 가장 좋은 가격에 즉시 체결되는 주문 종류는?  (3 글자)',
   NULL, '시장가', '시장가(Market) 주문은 “지금 즉시 체결” 우선입니다. 가격은 시장 상황에 맡깁니다.', 2);

-- Lesson: 자산 배분이란
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='alloc' AND l.slug='what-is-alloc');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '자산 배분의 가장 큰 목적은?',
   '["수익을 극대화","위험을 완전히 제거","위험을 분산해 수익을 일정 수준에서 안정화","세금 회피"]',
   '2', '자산 배분 = 한 자산에 몰빵하지 않고, 위험을 줄여 안정성을 키우는 전략입니다.', 1),
  (@lid, 'true_false', '“계란을 한 바구니에 담지 마라” 는 자산 배분의 정신과 가깝다.',
   NULL, 'true', '여러 바구니로 나누면 한 바구니가 떨어져도 모두 깨지진 않습니다.', 2);

-- Lesson: 위험과 수익
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='alloc' AND l.slug='risk-return');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '일반적으로 “기대 수익률이 높은” 자산의 특징은?',
   '["위험도 함께 높다","위험이 거의 없다","원금이 보장된다","가격이 변하지 않는다"]',
   '0', '“공짜 점심은 없다” — 기대 수익은 보통 위험과 함께 움직입니다.', 1);

-- Lesson: 금리
SET @lid = (SELECT l.id FROM lessons l JOIN units u ON u.id=l.unit_id WHERE u.slug='macro' AND l.slug='interest-rate');
INSERT INTO questions (lesson_id, type, prompt, options, answer, explanation, sort_order) VALUES
  (@lid, 'multiple_choice', '일반적으로 금리가 “오르면” 주식 시장에 미치는 영향으로 가장 자주 언급되는 것은?',
   '["기업의 차입 비용이 늘어 부담","기업의 매출이 즉시 두 배가 됨","주식이 자동으로 채권으로 변환됨","아무 영향 없음"]',
   '0', '금리가 오르면 빚의 이자 부담이 늘고, 미래 현금흐름의 현재가치가 낮아져 주가에는 부담 요인이 됩니다.', 1),
  (@lid, 'true_false', '금리는 “돈의 가격” 이라고 비유하기도 한다.',
   NULL, 'true', '금리는 돈을 빌리고 빌려주는 시장의 가격이라고 보는 것이 일반적입니다.', 2);
