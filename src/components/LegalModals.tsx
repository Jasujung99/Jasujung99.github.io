import React from "react";
import Modal from "@/components/Modal";
import { TERMS_TEXT, PRIVACY_TEXT } from "@/legal/texts";

export type LegalType = 'terms' | 'privacy' | 'combined';

function linkify(text: string): React.ReactNode {
  const urlRe = /(https?:\/\/[^\s)]+)(?=\s|\)|$)/g;
  const parts: (string | { url: string })[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push({ url: m[0] });
    lastIndex = end;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <React.Fragment key={i}>{p}</React.Fragment>
        ) : (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#2a6a66] underline break-all">
            {p.url}
          </a>
        )
      )}
    </>
  );
}

export function LegalContent({ type }: { type: LegalType }): JSX.Element {
  // 본문 내에서는 별도 큰 제목을 렌더링하지 않습니다(모달 헤더에 한 번만 표기).
  function renderBlock(text: string, keyPrefix: string) {
    const lines = text.split(/\n/);
    return (
      <div className="whitespace-pre-wrap">
        {lines.map((line, idx) => (
          <div key={`${keyPrefix}-${idx}`}>{linkify(line)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-[#333]">
      {type === 'combined' ? (
        <>
          {renderBlock(TERMS_TEXT, 'terms')}
          {renderBlock(PRIVACY_TEXT, 'privacy')}
        </>
      ) : (
        renderBlock(type === 'terms' ? TERMS_TEXT : PRIVACY_TEXT, type)
      )}
    </div>
  );
}

export function LegalModal({ open, onClose, type }: { open: boolean; onClose: () => void; type: LegalType }): JSX.Element | null {
  const title =
    type === 'combined'
      ? '서비스 이용 약관 및 개인정보 처리 방침'
      : type === 'terms'
        ? '서비스 이용 약관'
        : '개인정보 처리 방침';
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <LegalContent type={type} />
    </Modal>
  );
}
