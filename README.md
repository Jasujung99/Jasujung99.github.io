# Jasujung99.github.io

React + Vite 기반으로 구성된 개인 사이트입니다. Tailwind CSS로 스타일링하고 GitHub Pages를 통해 배포할 수 있도록 준비되어 있습니다.

## 개발 방법

- `npm install`
- `npm run dev`
- 브라우저에서 `http://localhost:5173` 확인

## 빌드

- `npm run build`
- 결과물은 `dist/` 디렉터리에 생성됩니다. GitHub Pages로 배포할 때는 이 디렉터리를 사용하세요.

## 참고

- `public/CNAME` 파일은 Namecheap에서 연결한 도메인 정보를 포함합니다. 배포 시 누락되지 않도록 유지하세요.
- 메일 구독 기능을 사용하려면 `.env` 파일에 `VITE_SUBSCRIPTION_ENDPOINT` 값을 설정하세요. 기본값은 Pageclip 폼(`https://send.pageclip.co/sBoFSNC6F9AuzNH0c1Fs5YBjtjOb5mkA`)으로 지정되어 있으며, 필요 시 다른 웹훅/폼 수집 엔드포인트 URL로 교체하면 됩니다.