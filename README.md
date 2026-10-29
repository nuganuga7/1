# 제철 과일 홈페이지

GitHub Pages로 공개하고 Pages CMS로 상품 정보를 관리합니다.

## 관리자

홈페이지 하단 **관리자** 또는 `/1/admin/`에서 안내를 확인합니다.
최초 1회 https://app.pagescms.org/ 에서 GitHub 로그인 및 GitHub App 연결 승인이 필요합니다.
권한을 줄 때 `nuganuga7/1` 저장소만 선택합니다. 추가 편집자는 초대하지 않습니다.
`.pages.yml`은 편집 항목을 정의하며 접근 통제 자체는 GitHub 및 Pages CMS 인증/저장소 권한이 담당합니다.

- 상품 관리: `data/products.json` — 상품 추가·삭제, 순서, 사진, 가격, 판매 상태, 타임세일, 주문 링크
- 홈페이지·타임세일: `data/settings.json` — 제목, 공지, 행사 표시, 종료 시각
- 사진 업로드: `assets/uploads` (공개 URL `/1/assets/uploads/...`)
- 변경을 저장하면 main 브랜치에 커밋되고 GitHub Pages가 자동 재배포됩니다.
- 종료 시간 형식: `YYYY-MM-DD HH:mm`, 한국시간. 새로고침해도 초기화되지 않습니다.
- 품절 상품은 주문 링크를 숨깁니다. 숨김 상품은 화면에서 제외되지만 공개 저장소에는 남습니다.
- 실제 주문 및 결제는 연결한 외부 판매 페이지에서 처리합니다.
- 비밀번호, 인증 토큰, 고객 개인정보를 공개 저장소에 넣지 마세요.

## 구성

`index.html`, `app.js`, `catalog-utils.mjs`가 데이터를 읽어 상품 목록 및 상세 팝업을 렌더링합니다. 텍스트는 textContent로 출력하고 주문 링크는 HTTPS만 허용합니다.
기존 가격이 들어간 참고 이미지는 가격 글자가 없는 영역만 표시하며 새 사진 업로드 시 교체됩니다.

## 검증

`node --test tests/catalog.test.mjs`
