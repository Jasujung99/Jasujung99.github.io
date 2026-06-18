import React from "react";
import { LEAD_API_URL } from "@/lib/config";

type Status = "idle" | "submitting" | "success" | "error";

export default function LeadForm(): JSX.Element {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [inquiry, setInquiry] = React.useState("");
  const [note, setNote] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && contact.trim().length > 0 && inquiry.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!LEAD_API_URL) {
      setStatus("error");
      setMessage("온라인 접수가 일시적으로 불가합니다. 네이버 톡톡 또는 전화로 문의해 주세요.");
      return;
    }
    try {
      setStatus("submitting");
      setMessage(null);
      const resp = await fetch(LEAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, inquiry, note, source: "haeum-homepage" }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.ok) {
        setStatus("success");
        setMessage("접수되었습니다. 곧 연락드리겠습니다.");
        setName(""); setContact(""); setInquiry(""); setNote("");
      } else {
        setStatus("error");
        setMessage("제출에 실패했습니다. 잠시 후 다시 시도하시거나 톡톡/전화로 문의해 주세요.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {!LEAD_API_URL && (
        <div className="rounded-md bg-[#fff6e6] px-3 py-2 text-[12px] text-[#7a4b00]">
          온라인 접수가 설정되지 않았습니다. 임시로 아래 연락처를 이용해 주세요.
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[#555]" htmlFor="lead-name">이름</label>
          <input id="lead-name" value={name} onChange={(e)=>setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#317873] focus:outline-none focus:ring-1 focus:ring-[#a1d4ca]"
            placeholder="이름" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#555]" htmlFor="lead-contact">연락수단</label>
          <input id="lead-contact" value={contact} onChange={(e)=>setContact(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#317873] focus:outline-none focus:ring-1 focus:ring-[#a1d4ca]"
            placeholder="전화번호 또는 이메일" required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#555]" htmlFor="lead-inquiry">문의 내용</label>
        <input id="lead-inquiry" value={inquiry} onChange={(e)=>setInquiry(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#317873] focus:outline-none focus:ring-1 focus:ring-[#a1d4ca]"
          placeholder="예: TOPIK II 대비, KIIP, 생활한국어 등" required />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#555]" htmlFor="lead-note">메모(선택)</label>
        <textarea id="lead-note" value={note} onChange={(e)=>setNote(e.target.value)}
          className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#317873] focus:outline-none focus:ring-1 focus:ring-[#a1d4ca]"
          placeholder="선호 시간대, 레벨, 기타 참고 사항" />
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={!canSubmit || status === "submitting"}
          className="rounded-md bg-[#317873] px-4 py-2 text-sm text-white hover:bg-[#2a6a66] disabled:cursor-not-allowed disabled:opacity-60">
          {status === "submitting" ? "제출 중..." : "상담 신청"}
        </button>
        {message && (
          <span className={"text-xs " + (status === "success" ? "text-[#285f5b]" : "text-[#8c2f39]")}>{message}</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-[#777]">제출 시 개인정보 수집·이용에 동의한 것으로 간주합니다.</p>
    </form>
  );
}
