import React from "react";
import LeadForm from "@/components/LeadForm";
import { CONTACT } from "@/lib/facts";

export default function EducationExam(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#fdfaf6] text-[#2f2f2f]">
      <header className="sticky top-0 z-10 bg-white p-6 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="#/" className="text-xl font-bold text-[#4a5d52]">해움한국어</a>
          <nav className="space-x-6 text-sm">
            <a href="#/" className="hover:text-[#317873]">홈</a>
            <a href="#/education-exam" className="text-[#317873] font-medium">교육·시험 안내</a>
            <a href="#/" className="hover:text-[#317873]">문의</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-10">
        {/* 상단 CTA */}
        <div className="mb-6 flex flex-wrap gap-3">
          <a href={CONTACT.talk} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#317873]/30 bg-white px-4 py-2 text-sm text-[#2a6a66] hover:bg-[#f0faf7]">네이버 톡톡</a>
          <a href={`tel:${CONTACT.PHONE.replace(/-/g, '')}`} className="rounded-full border border-[#317873]/30 bg-white px-4 py-2 text-sm text-[#2a6a66] hover:bg-[#f0faf7]">전화 {CONTACT.PHONE}</a>
          <a href="#lead" className="rounded-full bg-[#317873] px-4 py-2 text-sm text-white hover:bg-[#2a6a66]">상담 문의</a>
        </div>

        {/* 소개 요약 (KO/EN) */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-semibold text-[#4a5d52]">교육·시험 안내 Overview</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">소개(국문)</h3>
              <p className="text-sm text-[#444] leading-relaxed">
                해움한국어는 한국어 교육부터 문화 통합까지, 외국인의 한국 생활 전 과정을 종합적으로 지원하는 성공적인 한국살이 파트너입니다.
                기초적인 문법부터 고급 회화까지 체계적이고 세분화된 한국어 교육 과정을 제공하며, TOPIK 및 귀화·영주를 위한 종합·면접 시험 과정 등을 운영합니다.
                더불어 문화체험 워크숍을 통해, 낯선 한국 사회에 더욱 빨리 적응할 수 있도록 다양한 경험을 제공합니다.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">Overview (EN)</h3>
              <p className="text-sm text-[#444] leading-relaxed">
                Haeum Korean is your partner for a successful life in Korea, offering support from language education to cultural integration.
                We provide systematic courses (basic to advanced) and specialized programs for TOPIK and KIIP (Naturalization/Residency), plus cultural workshops.
              </p>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-10">
          <h3 className="mb-3 text-xl font-semibold text-[#4a5d52]">대상 · Target Audience</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="rounded-xl bg-white p-6 text-sm text-[#444] shadow-sm list-disc pl-5">
              <li>비자 및 국적취득, 대학 진학을 목표로 하는 외국인</li>
              <li>고용허가제 또는 E-7-4 비자 변경 등을 위해 한국어 학습이 필요한 외국인 근로자</li>
              <li>대전·청주·공주 등지에 거주하며 생활한국어, 언어교환, 문화체험/모임 대관이 필요한 학습자/커뮤니티</li>
            </ul>
            <ul className="rounded-xl bg-white p-6 text-sm text-[#444] shadow-sm list-disc pl-5">
              <li>Foreigners aiming for a visa, naturalization, or university entry</li>
              <li>Foreign workers needing Korean for EPS-TOPIK or E-7-4 visa</li>
              <li>Learners & communities in Chungcheong region seeking classes, language exchange, or space rentals</li>
            </ul>
          </div>
        </section>

        {/* Strengths & Features */}
        <section className="mb-10">
          <h3 className="mb-3 text-xl font-semibold text-[#4a5d52]">강점 및 특이점 · Strengths & Features</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="rounded-xl bg-white p-6 text-sm text-[#444] shadow-sm list-disc pl-5">
              <li>목표 맞춤형 전문 교육: TOPIK, 사회통합프로그램(KIIP), EPS-TOPIK 등 시험 대비 전문 교육(1:1/그룹/온라인·오프라인/출강)</li>
              <li>지역 기반 복합 문화 공간: 충청권 중심 접근성, 워크숍·인문예술모임·동아리 대관이 가능한 커뮤니티 허브</li>
              <li>실생활 및 문화 연계: 생활 한국어·문화체험 프로그램을 통해 한국 사회 적응과 문화 교류 지원</li>
            </ul>
            <ul className="rounded-xl bg-white p-6 text-sm text-[#444] shadow-sm list-disc pl-5">
              <li>Goal-oriented specialized education for TOPIK, KIIP, EPS-TOPIK</li>
              <li>Regional community hub in Chungcheong area (Daejeon/Cheongju/Gongju)</li>
              <li>Real-life and cultural integration via various programs/workshops</li>
            </ul>
          </div>
        </section>

        {/* 프로그램/시험 안내 요약 */}
        <section className="mb-12">
          <h3 className="mb-3 text-xl font-semibold text-[#4a5d52]">프로그램/시험 안내 Program Overview</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h4 className="mb-2 font-semibold">한국어 과정</h4>
              <ul className="list-disc pl-5 text-sm text-[#444]">
                <li>기초·문법 → 회화 심화(맞춤 커리큘럼)</li>
                <li>실전 회화/작문/발표 훈련</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h4 className="mb-2 font-semibold">시험 대비</h4>
              <ul className="list-disc pl-5 text-sm text-[#444]">
                <li>TOPIK I/II 집중 대비 (파트별 전략·모의)</li>
                <li>사회통합프로그램(KIIP) 연계, 귀화/영주 종합·면접 준비</li>
                <li>EPS‑TOPIK(고용허가제) 학습 지원</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm md:col-span-2">
              <h4 className="mb-2 font-semibold">문화체험/커뮤니티</h4>
              <p className="text-sm text-[#444]">문화체험 워크숍, 인문예술 모임, 동아리·커뮤니티 대관 등 지역 기반 활동 운영</p>
            </div>
          </div>
        </section>

        {/* 하단 상담 문의 섹션 */}
        <section id="lead" className="mb-16">
          <h3 className="mb-3 text-xl font-semibold text-[#4a5d52]">상담 문의</h3>
          <p className="mb-4 text-sm text-[#555]">이름/연락수단/문의 내용을 남겨주세요. 빠르게 연락드리겠습니다.</p>
          <div className="rounded-xl border border-[#317873]/10 bg-white p-6 shadow-sm">
            <LeadForm />
          </div>
        </section>

        {/* 하단 CTA 반복 */}
        <div className="mb-6 flex flex-wrap gap-3">
          <a href={CONTACT.talk} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#317873]/30 bg-white px-4 py-2 text-sm text-[#2a6a66] hover:bg-[#f0faf7]">네이버 톡톡</a>
          <a href={`tel:${CONTACT.PHONE.replace(/-/g, '')}`} className="rounded-full border border-[#317873]/30 bg-white px-4 py-2 text-sm text-[#2a6a66] hover:bg-[#f0faf7]">전화 {CONTACT.PHONE}</a>
        </div>
      </main>
    </div>
  );
}
