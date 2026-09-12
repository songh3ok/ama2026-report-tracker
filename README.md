# The 15th AMA Triennial Convention Incheon 2026
## 발표자료 및 보고서 실시간 접수 모니터링 시스템 (Report Tracker)

2026년 인천에서 개최되는 제15차 AMA 대회("The Gospel and the Future of Humanity")의 주요 발표자 24명(플래너리 세션 강의/논찬, 글로벌링크 리포트, 내셔널 리포트)의 발표 원고 및 프레젠테이션 접수 현황을 실시간으로 확인하고 관리하는 웹 대시보드입니다.

---

### 🌟 주요 기능
1. **실시간 모니터링 대시보드**: 총 대상자 24명 중 제출 완료, 미제출, 검토중 상태를 한눈에 파악하는 KPI 통계 및 진행률 바
2. **원클릭 제출 상태 토글**: 클릭 한 번으로 미제출 ↔ 제출완료 전환 및 접수 일시 자동 기록
3. **상세 정보 및 링크 관리**: 발제 제목, 구글 드라이브/클라우드 링크, 강사 연락처, 메모 관리
4. **리마인더 독촉 메시지 자동 생성**: 미제출 강사 대상 한국어(카카오톡) 및 영어(이메일/왓츠앱) 맞춤형 독촉 템플릿 원클릭 복사
5. **다중 필터 및 검색**: 일자별(9.15~9.18), 세션 분류별, 접수 상태별 필터 및 실시간 텍스트 검색
6. **카드 뷰 & 테이블 뷰**: 사용자 취향에 맞춘 그리드 카드 뷰와 밀도 높은 테이블 목록 뷰 지원
7. **데이터 영속성 및 내보내기**: 브라우저 로컬 저장소 자동 동기화, UTF-8 BOM 지원 Excel/CSV 내보내기, JSON 백업/복원
8. **다크 모드 & 라이트 모드**: 절제된 타이포그래피 중심의 반응형 UI (모바일 타임라인 · PDF 그리드)

---

### 👥 관리 대상 세션 및 발표자 (총 24명)

#### 1. 플래너리 세션 (Plenary Sessions: 14명)
- **9.15(화) 09:40-10:30 [AI]**: Dr. Sung Jin Park (강사) / Dr. Daniel Min (논찬)
- **9.15(화) 11:10-12:00 [Diaspora]**: Rev. Barnabas Moon (강사) / Dr. Sheraz Akhtar (논찬)
- **9.16(수) 09:40-10:30 [Religious Pluralism]**: Dr. Ashok Kumar (강사) / Dr. Peter Thein Nyunt (논찬)
- **9.16(수) 11:10-12:00 [Justice]**: Ms. Misun Woo (강사) / Mr. Joonho Min (논찬)
- **9.17(목) 09:40-10:30 [Healing]**: Dr. Edmund Ng (강사) / Dr. Yeo Pei Li (논찬)
- **9.17(목) 11:10-12:00 [The Created World]**: Mr. Lawrence Ko (강사) / Dr. Bokyoung Park (논찬)
- **9.18(금) 09:40-10:30 [The Next Generation]**: Dr. Vo Huong Nam (강사) / Dr. B.J. Jun (논찬)

#### 2. 글로벌링크 리포트 (Global Links Reports: 6명)
- **9.15(화) 13:40-14:10**: Mr. Philip Chang (Lausanne) / Rev. Peter Oyugi (MANI)
- **9.16(수) 13:40-14:10**: Dr. Jamie Mātenga (WEA-MC) / Ms. Noemi Troncoso (COMIBAM)
- **9.17(목) 13:40-14:10**: Dr. Greg Parsons (Frontier Ventures) / Rev. David Bogosian (Missio Nexus)

#### 3. 내셔널 리포트 (National Reports: 4명)
- **9.15(화) 저녁**: Ps. Marat Allakuatov (Uzbekistan) / Rev. Luvsangombo Gantumur (Mongolia)
- **9.17(목) 저녁**: Rev. Poline Yean (Cambodia) / Dr. Thang Cin Lian (Myanmar)

---

### 💻 로컬 개발 환경 실행
```bash
npm install
npm run dev
```

### 🚀 Vercel 배포
Vercel에 배포하여 누구나 브라우저에서 `https://*.vercel.app` 주소로 접속할 수 있습니다:
```bash
npx vercel
```
또는 GitHub 리포지토리를 [Vercel Dashboard](https://vercel.com/new)에서 임포트하면 푸시할 때마다 자동 배포됩니다.
