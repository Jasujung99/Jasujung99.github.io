import React, { useState, useEffect } from "react";
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
    <Modal open={isOpen} title="홈페이지 수정 및 개선 안내" onClose={handleClose}>
      <div className="space-y-5 text-[#2f2f2f]">
        <div className="space-y-3">
          <p className="text-[15px] leading-relaxed">
            더 나은 서비스 제공을 위해 홈페이지의 주요 기능들을 수정 및 개선하였습니다.
          </p>
          <div className="rounded-lg bg-gray-50 p-4 space-y-3 border border-gray-100">
            <div className="flex gap-3">
              <span className="flex-none font-bold text-[#317873]">01</span>
              <div>
                <p className="font-semibold text-sm">이메일 구독 기능 안정화</p>
                <p className="text-xs text-gray-500 mt-0.5">이메일 입력 시 발생하던 데이터베이스 연결 오류를 해결했습니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-none font-bold text-[#317873]">02</span>
              <div>
                <p className="font-semibold text-sm">AI 도움봇 답변 성능 개선</p>
                <p className="text-xs text-gray-500 mt-0.5">답변이 사라지거나 표시되지 않던 버그를 수정하고 답변 정확도를 높였습니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-none font-bold text-[#317873]">03</span>
              <div>
                <p className="font-semibold text-sm">시스템 최적화</p>
                <p className="text-xs text-gray-500 mt-0.5">전반적인 성능 최적화 및 안정적인 서비스 환경을 구축했습니다.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <label className="flex items-center gap-2 text-[13px] text-gray-500 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#317873] focus:ring-[#317873] cursor-pointer"
            />
            오늘 하루 동안 열지 않기
          </label>
          <button
            onClick={handleClose}
            className="rounded-md bg-[#317873] px-6 py-2 text-sm font-medium text-white hover:bg-[#285f5b] transition-colors shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
