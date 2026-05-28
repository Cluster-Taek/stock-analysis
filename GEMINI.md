---
alwaysApply: true
description: 기본 규칙 적용
globs:
  - 'src/**/*.tsx'
---

# 기본 규칙

## 컴포넌트 개발 시 필수 사항

1. **깃허브 관련 작업 하지 않기**: 깃허브 관련 작업은 하지 않습니다.

2. **any 사용 자제**: any 혹은 unknown 타입은 최대한 사용을 지양합니다.

---

alwaysApply: true
description: medusa-ui 규칙 적용
globs:

- 'src/\*_/_.tsx'

---

# Medusa UI 개발 규칙

## 컴포넌트 개발 시 필수 사항

1. **medusa/components 최우선 활용**: UI 개발 시 `src/medusa/components/` 폴더의 기존 컴포넌트를 최우선으로 활용하세요. 필요한 컴포넌트가 없거나 부족한 경우에만 `src/medusa/docs/` 문서를 참고하여 새로운 컴포넌트를 개발합니다.

2. **사용 가능한 기존 컴포넌트**:

   - action-menu - 액션 메뉴 컴포넌트
   - divider - 구분선 컴포넌트
   - empty-table-content - 빈 테이블 컨텐츠 컴포넌트
   - header - 헤더 컴포넌트
   - icon-avatar - 아이콘 아바타 컴포넌트
   - json-view-section - JSON 뷰 섹션 컴포넌트
   - logo-box - 로고 박스 컴포넌트
   - metadata-section - 메타데이터 섹션 컴포넌트
   - pagination - 페이지네이션 컴포넌트
   - section-row - 섹션 행 컴포넌트
   - skeleton - 스켈레톤 컴포넌트
   - spinner - 스피너 컴포넌트
   - table - 테이블 컴포넌트
   - upload-button - 업로드 버튼 컴포넌트

3. **사용 가능한 컴포넌트 문서**:

   - alert.md - 알림 컴포넌트
   - avatar.md - 아바타 컴포넌트
   - badge.md - 배지 컴포넌트
   - button.md - 버튼 컴포넌트
   - calendar.md - 캘린더 컴포넌트
   - checkbox.md - 체크박스 컴포넌트
   - code-block.md - 코드블록 컴포넌트
   - color.md - 색상 가이드
   - command-bar.md - 커맨드바 컴포넌트
   - command.md - 커맨드 컴포넌트
   - container.md - 컨테이너 컴포넌트
   - copy.md - 복사 컴포넌트
   - currency-input.md - 통화 입력 컴포넌트
   - data-table.md - 데이터 테이블 컴포넌트
   - date-picker.md - 날짜 선택 컴포넌트
   - drawer.md - 드로어 컴포넌트
   - dropdown-menu.md - 드롭다운 메뉴 컴포넌트
   - focus-modal.md - 포커스 모달 컴포넌트
   - heading.md - 헤딩 컴포넌트
   - icon-badge.md - 아이콘 배지 컴포넌트
   - icon-button.md - 아이콘 버튼 컴포넌트
   - icon.md - 아이콘 컴포넌트
   - inline-tip.md - 인라인 팁 컴포넌트
   - input.md - 입력 컴포넌트
   - kbd.md - 키보드 컴포넌트
   - label.md - 라벨 컴포넌트
   - progress-accordion.md - 진행률 아코디언 컴포넌트
   - progress-tabs.md - 진행률 탭 컴포넌트
   - prompt.md - 프롬프트 컴포넌트
   - radio-group.md - 라디오 그룹 컴포넌트
   - select.md - 셀렉트 컴포넌트
   - status-badge.md - 상태 배지 컴포넌트
   - switch.md - 스위치 컴포넌트
   - table.md - 테이블 컴포넌트
   - tabs.md - 탭 컴포넌트
   - text.md - 텍스트 컴포넌트
   - textarea.md - 텍스트영역 컴포넌트
   - toast.md - 토스트 컴포넌트

4. **개발 프로세스**:

   - **1단계**: `src/medusa/components/` 폴더에서 필요한 기존 컴포넌트 확인 및 활용
   - **2단계**: 기존 컴포넌트가 없거나 부족한 경우, 해당 문서의 API, 사용법, 스타일 가이드를 숙지
   - **3단계**: 문서에 명시된 props, variants, 접근성 가이드라인 준수
   - **4단계**: 일관된 디자인 시스템 유지를 위해 문서의 예제 코드 참고

5. **컴포넌트 우선 개발**: 새로운 UI 요소가 필요한 경우, 먼저 `src/medusa/components/`의 기존 컴포넌트로 구현 가능한지 확인하고, 없다면 medusa/docs를 참고하여 개발 진행
