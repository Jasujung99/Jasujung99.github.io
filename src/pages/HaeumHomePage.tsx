import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function HaeumHomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#2f2f2f] font-sans">
      <header className="p-6 shadow-sm bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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

      <main className="px-4 md:px-8 max-w-6xl mx-auto">
        <section className="py-20 text-center">
          <h2 className="text-3xl font-semibold text-[#4a5d52] mb-4">
            언어로 만나는 따뜻한 공동체, 꿈꾸는 공간
          </h2>
          <p className="text-lg text-[#5b5b5b] max-w-2xl mx-auto">
            낭독, 토론, 소통을 통해 서로를 이해하고, 성찰하는 공간.
            <br />
            해움한국어는 사람과 마음을 잇는 배움의 마당입니다.
          </p>
        </section>

        <section id="about" className="py-16">
          <h3 className="text-2xl font-semibold text-[#4a5d52] mb-6">해움 소개</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#f7f4ef]">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-2">우리 철학</h4>
                <p className="text-sm text-[#444]">
                  해움한국어는 언어 교육을 넘어, 서로를 존중하고 이해하는 문화를 실천하는 공간입니다. 학문적 성찰과 정서적 교감을 함께 나눕니다.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#f7f4ef]">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-2">운영자 이력</h4>
                <p className="text-sm text-[#444]">
                  미디어·심리학 기반의 교육 전공, 미술치료·독서토론 운영 경험을 바탕으로 참여자의 성장을 도우며, 공감과 나눔을 중심에 둡니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="programs" className="py-16">
          <h3 className="text-2xl font-semibold text-[#4a5d52] mb-6">프로그램 안내</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Card className="bg-white">
              <CardContent className="p-5">
                <h4 className="font-bold mb-1">온라인 수업</h4>
                <p>실시간 강의 / 온라인 독서 모임 / 글로벌 언어 교류</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-5">
                <h4 className="font-bold mb-1">오프라인 활동</h4>
                <p>서울 중심 대면 수업 / 정기 낭독회 / 인문 워크숍</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-5">
                <h4 className="font-bold mb-1">출강 및 협업</h4>
                <p>학교·기관 외부 강의 / 맞춤형 커리큘럼 설계</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="contact" className="py-16">
          <h3 className="text-2xl font-semibold text-[#4a5d52] mb-4">문의 및 참여</h3>
          <p className="text-sm text-[#444] mb-4">
            네이버 예약을 통해 모임에 참여하고, 새 프로그램 소식을 받아보세요.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="이메일 주소 입력" className="w-full md:w-1/2" />
            <Button className="bg-[#317873] hover:bg-[#285f5b] text-white">
              소식 받기
            </Button>
          </div>
        </section>

        <Separator className="my-10" />

        <footer className="text-center text-xs text-[#999] pb-10">
          © 2025 해움한국어 | 마음과 언어를 잇는 배움의 공간
        </footer>
      </main>
    </div>
  );
}

export default HaeumHomePage;
