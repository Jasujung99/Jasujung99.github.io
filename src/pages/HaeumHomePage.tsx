import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import AnimatedBackground from "@/components/AnimatedBackground";

function HaeumHomePage(): JSX.Element {
  const [showNotice, setShowNotice] = useState(true);
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Serverless backend endpoint (Cloudflare Worker)
  const subscribeApi = "https://sweet-bird-16a2.jasujung404.workers.dev/api/subscribe";

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setShowNotice(false), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  // 프로그램 카드 리빌(프린트처럼 아래→위): IntersectionObserver + 스태거
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = document.getElementById('programs');
    const nodeList = container?.querySelectorAll<HTMLElement>('.reveal-card');
    const cards: HTMLElement[] = nodeList ? Array.from(nodeList) : [];
    if (cards.length === 0) return;

    if (reduce) {
      // 모션 감소: 즉시 표시
      cards.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const idx = cards.indexOf(el);
        // 3열 그리드 기준, 열/행 기반 스태거(느리게): 더 큰 지연값
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const delayMs = col * 160 + row * 260; // 열 우선 160ms, 행 추가 260ms
        el.style.animationDelay = `${delayMs}ms`;
        el.classList.add('motion-safe:animate-revealUpSlow');
        // 한 번만 재생
        io.unobserve(el);
      });
    }, { root: null, threshold: 0.15, rootMargin: "0px 0px -5% 0px" });

    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 문의 및 참여 섹션 리빌: 천천히 나타남
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const contact = document.getElementById('contact');
    const nodeList = contact?.querySelectorAll<HTMLElement>('.reveal-contact');
    const parts: HTMLElement[] = nodeList ? Array.from(nodeList) : [];
    if (parts.length === 0) return;

    if (reduce) {
      parts.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        // 순차 지연(느리게)
        const idx = parts.indexOf(el);
        const delayMs = 200 + idx * 200; // 0.2s부터 0.2s 간격
        el.style.animationDelay = `${delayMs}ms`;
        el.classList.add('motion-safe:animate-revealUpSlow');
        io.unobserve(el);
      });
    }, { root: null, threshold: 0.15 });

    parts.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#fdfaf6] font-sans text-[#2f2f2f]">
      {showNotice && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-sm leading-relaxed">
              웹사이트 개발 중으로 보여지는 내용은 실제와 다소 상이할 수 있습니다.
            </p>
            <Button
              className="mt-4 w-full bg-[#317873] text-white hover:bg-[#285f5b]"
              onClick={() => setShowNotice(false)}
            >
              확인
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative min-h-screen transition-all duration-300",
          showNotice ? "pointer-events-none blur-sm" : ""
        )}
        aria-hidden={showNotice}
      >
        <header className="sticky top-0 z-10 bg-white p-6 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <h1 className="text-xl font-bold text-[#4a5d52]">해움한국어</h1>
            <nav className="space-x-6 text-sm">
              <a href="#about" className="hover:text-[#317873]">
                소개
              </a>
              <a href="#programs" className="hover:text-[#317873]">
                프로그램
              </a>
              <a href="#contact" className="hover:text-[#317873]">
                문의
              </a>
            </nav>
          </div>
        </header>

        {/* Full-bleed hero */}
        <section className="relative overflow-hidden py-20 text-center">
            <AnimatedBackground />
            <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
              <h2 className="mb-4 text-3xl font-semibold text-[#4a5d52]">
                언어로 만나는 따뜻한 공동체, 꿈꾸는 곳간
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#5b5b5b]">
                인문학, 예술, 소통을 통해 서로를 이해하고, 마주하는 공간.
                <br />
                해움한국어는 사람과 마음을 잇는 열린 마당입니다.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://m.place.naver.com/place/1283919586/home"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
                >
                  <img
                    src="/icons/place.png"
                    alt=""
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  네이버 스마트플레이스
                </a>
                <a
                  href="https://blog.naver.com/haeumkorean"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
                >
                  <img
                    src="/icons/blog.png"
                    alt=""
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  네이버 블로그
                </a>
                <a
                  href="https://talk.naver.com/W7AQRM9"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
                >
                  <img
                    src="/icons/talktalk.png"
                    alt=""
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  네이버 톡톡
                </a>
              </div>
            </div>
          </section>

        <main className="mx-auto max-w-6xl px-4 md:px-8">

          <section id="about" className="py-16">
            <h3 className="mb-6 text-2xl font-semibold text-[#4a5d52]">해움 소개</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-[#f7f4ef]">
                <CardContent className="p-6">
                  <h4 className="mb-2 text-lg font-semibold">우리 철학</h4>
                  <p className="text-sm text-[#444]">
                    해움한국어는 언어 교육을 넘어, 서로를 존중하고 이해하는 문화를 실천하는 곳입니다. 지적인 교류와 문화적 소통을 꿈꿉니다.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#f7f4ef]">
                <CardContent className="p-6">
                  <h4 className="mb-2 text-lg font-semibold">운영자 이력</h4>
                  <p className="text-sm text-[#444]">
                    미디어·심리학 기반의 교육 전공, 미술치료·독서토론 운영 경험을 바탕으로 참여자의 통찰을 북돋우며, 공감과 나눔에 귀를 엽니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="programs" className="py-16">
            <h3 className="mb-6 text-2xl font-semibold text-[#4a5d52]">프로그램 안내</h3>

            {/* 교육/시험 대비 */}
            <h4 className="mb-3 text-lg font-semibold text-[#4a5d52]">교육/시험 대비</h4>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">한국어 기초·문법</h5>
                  <p>한글과 기본 문장 구조를 기초부터 탄탄히 다져, 학습 초보자에게 맞춤형으로 제공</p>
                </CardContent>
              </Card>
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">고급 회화·심화</h5>
                  <p>다양한 주제 토론, 발표 및 작문으로 고급 표현 집중 연습</p>
                </CardContent>
              </Card>
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">TOPIK I/II 집중 대비</h5>
                  <p>각 파트별 전략과 실전 모의로 단기 목표 달성형 커리큘럼 운영</p>
                </CardContent>
              </Card>
            </div>

            {/* 정착/문화/커뮤니티 */}
            <h4 className="mt-8 mb-3 text-lg font-semibold text-[#4a5d52]">정착/문화/커뮤니티</h4>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">사회통합프로그램(KIIP)·비자/국적</h5>
                  <p>KIIP 프로그램 연계, 귀화 및 영주권을 위한 종합·면접 준비까지 전문 지원</p>
                </CardContent>
              </Card>
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">생활한국어·언어교환</h5>
                  <p>직장생활과 일상에 필요한 표현, 언어 교환 활동으로 실전 감각 강화</p>
                </CardContent>
              </Card>
              <Card className="bg-white reveal-card opacity-0 will-change-transform">
                <CardContent className="p-5">
                  <h5 className="mb-1 font-bold">문화체험·로컬 허브</h5>
                  <p>충청권을 아우르며 워크숍, 인문예술 모임, 동아리 공간 대관을 통한 지역 사회 문화 체험 기회 제공</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="contact" className="py-16">
            <h3 className="mb-4 text-2xl font-semibold text-[#4a5d52] reveal-contact opacity-0 will-change-transform">문의 및 참여</h3>
            <p className="mb-4 text-sm text-[#444] reveal-contact opacity-0 will-change-transform">
              유용한 소식은 이메일을 통해 가장 먼저 전달할게요. 관심과 성원 감사합니다. 🙏
            </p>
            {/* 구독 영역: 인라인 입력 + 버튼 → 서버리스로 전송 */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#317873]/10 bg-white p-6 shadow-sm reveal-contact opacity-0 will-change-transform">
              <form
                className="flex w-full flex-col gap-3 md:flex-row md:items-center"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isValidEmail(email)) {
                    setFormStatus("error");
                    setFormMessage("올바른 이메일 주소를 입력해 주세요.");
                    return;
                  }
                  try {
                    setFormStatus("submitting");
                    setFormMessage(null);
                    const resp = await fetch(subscribeApi, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, source: "haeum-homepage" }),
                    });
                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data?.ok) {
                      setFormStatus("success");
                      setFormMessage(
                        data.created
                          ? "신청이 접수되었습니다. 소식 전해드릴게요!"
                          : "이미 신청하신 이메일입니다. 최신 소식을 곧 전해드릴게요."
                      );
                      setEmail("");
                    } else if (data?.error === "invalid_email") {
                      setFormStatus("error");
                      setFormMessage("올바른 이메일 주소를 입력해 주세요.");
                    } else {
                      setFormStatus("error");
                      setFormMessage("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                    }
                  } catch (err) {
                    setFormStatus("error");
                    setFormMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                  }
                }}
              >
                <Input
                  type="email"
                  placeholder="이메일 주소 입력"
                  autoComplete="email"
                  className="w-full flex-1 md:w-auto"
                  aria-label="이메일 주소"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button
                  type="submit"
                  disabled={formStatus === "submitting" || email.trim().length === 0}
                  className={cn(
                    "shrink-0 bg-[#317873] text-white hover:bg-[#285f5b] disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {formStatus === "submitting" ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      전송 중...
                    </span>
                  ) : (
                    "소식 받기"
                  )}
                </Button>
              </form>

              {/* 결과/오류 메시지 */}
              <div
                className={cn(
                  "rounded-md px-4 py-2 text-xs",
                  formStatus === "success"
                    ? "bg-[#e0f2ef] text-[#285f5b]"
                    : formStatus === "error"
                      ? "bg-[#fdeaea] text-[#8c2f39]"
                      : "hidden"
                )}
                aria-live="polite"
              >
                {formMessage}
              </div>

              <p className="text-[11px] leading-relaxed text-[#777]">
                ※ 이메일 입력 및 제출 시 개인 정보 수집에 동의한 것으로 간주합니다.
              </p>
              <p className="text-[11px] leading-relaxed text-[#777]">
                * 수집 항목: 이메일 주소 · 수집 목적: 프로그램 소식 및 안내 발송 · 보유 기간: 구독 해지 또는 삭제 요청 시까지
              </p>
            </div>
          </section>

          <Separator className="my-10" />

          <footer className="pb-10 text-center text-xs text-[#999]">
            © 2025 해움한국어 | 언어로 만나는 따뜻한 공동체
          </footer>
        </main>
      </div>
    </div>
  );
}

export default HaeumHomePage;
