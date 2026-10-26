import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem("announcement_hidden_until");
    if (!hiddenUntil || new Date().getTime() > parseInt(hiddenUntil)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      const until = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("announcement_hidden_until", until.toString());
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      title="공지사항"
      onClose={handleClose}
      className="mx-4 !h-auto max-h-[calc(100dvh-2rem)] self-center rounded-2xl md:max-w-lg"
    >
      <div className="px-1 pb-1 pt-3 text-[#2f2f2f] sm:px-3 sm:pt-5">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f1] text-[#317873]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <ellipse cx="12" cy="12" rx="4" ry="9" />
            <path d="M3 12h18" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-[#4a5d52]">새로운 주소에서 만나요</h3>
        <div className="mt-5 rounded-2xl border border-[#317873]/15 bg-[#f4f8f5] p-5">
          <p className="text-sm leading-relaxed text-[#5b5b5b]">
            <span className="font-medium">haeumkorean.me</span>에서
          </p>
          <a
            href="https://haeum.haeonkorea.com"
            className="mt-2 inline-block break-all text-lg font-semibold tracking-tight text-[#285f5b] underline decoration-[#317873]/25 underline-offset-4 transition hover:decoration-[#317873] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#317873] sm:text-xl"
          >
            haeum.haeonkorea.com
          </a>
          <p className="mt-2 text-sm leading-relaxed text-[#5b5b5b]">으로 도메인을 변경하였습니다.</p>
        </div>

        <div className="my-6 flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 h-5 w-5 shrink-0 text-[#317873]" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <p className="text-sm leading-7 text-[#5b5b5b]">
            한국어 학습 및 유튜브 라이브 등의 소식은{' '}
            <strong className="font-semibold text-[#317873]">페이지 하단 뉴스레터 등록</strong>을 통해 이메일로 받아보실 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#317873]/10 pt-4">
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-[#666] sm:text-[13px]">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#317873]"
            />
            오늘 하루 동안 열지 않기
          </label>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-[#317873] px-7 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#285f5b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#317873]"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
