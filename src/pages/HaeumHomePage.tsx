import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function HaeumHomePage(): JSX.Element {
  const [showNotice, setShowNotice] = useState(true);

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
                href="https://m.place.naver.com/your-smart-place"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M4 4h16v16H4z" opacity="0.1" />
                  <path d="M9.5 7H8v10h2v-5.76L14 17h2V7h-2v5.73z" />
                </svg>
                네이버 스마트플레이스
              </a>
              <a
                href="https://blog.naver.com/your-blog"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M4 4h16v16H4z" opacity="0.1" />
                  <path d="M8 8h2.75a2.25 2.25 0 0 1 0 4.5H10v3.5H8zm2 3.08h.7a.83.83 0 1 0 0-1.66H10zM13.5 8H16a2 2 0 0 1 2 2v5.5h-2v-1.4h-2v1.4h-2V10a2 2 0 0 1 2-2m0 3.3H16V10a.3.3 0 0 0-.3-.3h-.9a.3.3 0 0 0-.3.3z" />
                </svg>
                네이버 블로그
              </a>
              <a
                href="https://talk.naver.com/your-talk"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-[#317873]/20 bg-white px-5 py-2 text-sm font-medium text-[#317873] shadow-sm transition hover:border-[#317873] hover:bg-[#317873] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 1.36 0 2.65-.3 3.82-.87L21 21l-.47-5.17A8.97 8.97 0 0 0 21 12a9 9 0 0 0-9-9z" opacity="0.15" />
                  <path d="M12 5a7 7 0 0 0-4.96 11.94l-.3 3.3 3.02-1.4A7 7 0 1 0 12 5zm0 2a5 5 0 0 1 0 10 5.02 5.02 0 0 1-2.46-.66l-.53-.3-.6.28.08-.91-.66-.45A5 5 0 0 1 12 7z" />
                </svg>
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
            <div className="flex flex-col gap-4 md:flex-row">
              <Input placeholder="이메일 주소 입력" className="w-full md:w-1/2" />
              <Button className="bg-[#317873] text-white hover:bg-[#285f5b]">
                소식 받기
              </Button>
            </div>
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
