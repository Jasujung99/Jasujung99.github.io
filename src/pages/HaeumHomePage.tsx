import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function HaeumHomePage(): JSX.Element {
  const [showNotice, setShowNotice] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const subscriptionEndpoint = (
    import.meta.env.VITE_SUBSCRIPTION_ENDPOINT ??
    "https://send.pageclip.co/sBoFSNC6F9AuzNH0c1Fs5YBjtjOb5mkA"
  ).trim();

  useEffect(() => {
    const timer = window.setTimeout(() => setShowNotice(false), 4000);
    return () => window.clearTimeout(timer);
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

        <main className="mx-auto max-w-6xl px-4 md:px-8">
          <section className="py-20 text-center">
            <h2 className="mb-4 text-3xl font-semibold text-[#4a5d52]">
              언어로 만나는 따뜻한 공동체, 꿈꾸는 공간
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#5b5b5b]">
              낭독, 토론, 소통을 통해 서로를 이해하고, 성찰하는 공간.
              <br />
              해움한국어는 사람과 마음을 잇는 배움의 마당입니다.
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
          </section>

          <section id="about" className="py-16">
            <h3 className="mb-6 text-2xl font-semibold text-[#4a5d52]">해움 소개</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-[#f7f4ef]">
                <CardContent className="p-6">
                  <h4 className="mb-2 text-lg font-semibold">우리 철학</h4>
                  <p className="text-sm text-[#444]">
                    해움한국어는 언어 교육을 넘어, 서로를 존중하고 이해하는 문화를 실천하는 공간입니다. 학문적 성찰과 정서적 교감을 함께 나눕니다.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#f7f4ef]">
                <CardContent className="p-6">
                  <h4 className="mb-2 text-lg font-semibold">운영자 이력</h4>
                  <p className="text-sm text-[#444]">
                    미디어·심리학 기반의 교육 전공, 미술치료·독서토론 운영 경험을 바탕으로 참여자의 성장을 도우며, 공감과 나눔을 중심에 둡니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="programs" className="py-16">
            <h3 className="mb-6 text-2xl font-semibold text-[#4a5d52]">프로그램 안내</h3>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <Card className="bg-white">
                <CardContent className="p-5">
                  <h4 className="mb-1 font-bold">온라인 수업</h4>
                  <p>실시간 강의 / 온라인 독서 모임 / 글로벌 언어 교류</p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-5">
                  <h4 className="mb-1 font-bold">오프라인 활동</h4>
                  <p>서울 중심 대면 수업 / 정기 낭독회 / 인문 워크숍</p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-5">
                  <h4 className="mb-1 font-bold">출강 및 협업</h4>
                  <p>학교·기관 외부 강의 / 맞춤형 커리큘럼 설계</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="contact" className="py-16">
            <h3 className="mb-4 text-2xl font-semibold text-[#4a5d52]">문의 및 참여</h3>
            <p className="mb-4 text-sm text-[#444]">
              네이버 예약을 통해 모임에 참여하고, 새 프로그램 소식을 받아보세요.
            </p>
            <form
              className="pageclip-form flex flex-col gap-4 rounded-xl border border-[#317873]/10 bg-white p-6 shadow-sm"
              action={subscriptionEndpoint || undefined}
              method="post"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                if (!subscriptionEndpoint) {
                  event.preventDefault();
                  setFormMessage("제출 경로가 설정되지 않았습니다. VITE_SUBSCRIPTION_ENDPOINT 값을 확인해주세요.");
                  return;
                }

                setFormMessage(null);
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일 주소 입력"
                  autoComplete="email"
                  className="w-full md:w-1/2"
                  aria-label="이메일 주소"
                  required
                />
                <Button
                  type="submit"
                  disabled={!subscriptionEndpoint}
                  className="pageclip-form__submit bg-[#317873] text-white hover:bg-[#285f5b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>소식 받기</span>
                </Button>
              </div>

              <label className="flex items-start gap-3 text-xs text-[#444]">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  className="mt-1 h-4 w-4 rounded border border-[#317873]/50"
                  value="accepted"
                  required
                />
                <span>
                  개인정보 수집·이용에 동의합니다. 수집된 이메일은 해움한국어 프로그램 및 소식 안내 목적에만 사용하며,
                  이용자는 언제든지 구독 해지를 요청할 수 있습니다.
                </span>
              </label>

              <input type="hidden" name="source" value="haeum-homepage" />

              <p className="text-[11px] leading-relaxed text-[#777]">
                * 수집 및 보관 항목: 이메일 주소 · 수집 목적: 프로그램 소식 및 안내 발송 · 보유 및 이용 기간: 구독 해지 요청 시까지
              </p>

              {formMessage && (
                <div className="rounded-md bg-[#fdeaea] px-4 py-2 text-xs text-[#8c2f39]">
                  {formMessage}
                </div>
              )}

              {!subscriptionEndpoint && !formMessage && (
                <div className="rounded-md border border-dashed border-[#317873]/30 bg-[#f9f7f2] px-4 py-3 text-[11px] text-[#555]">
                  VITE_SUBSCRIPTION_ENDPOINT 환경 변수가 설정되지 않아 제출 내용이 저장되지 않습니다. Pageclip에서 발급한 폼
                  액션 URL을 환경 변수로 설정한 뒤 다시 시도해주세요.
                </div>
              )}
            </form>
          </section>

          <Separator className="my-10" />

          <footer className="pb-10 text-center text-xs text-[#999]">
            © 2025 해움한국어 | 마음과 언어를 잇는 배움의 공간
          </footer>
        </main>
      </div>
    </div>
  );
}

export default HaeumHomePage;
