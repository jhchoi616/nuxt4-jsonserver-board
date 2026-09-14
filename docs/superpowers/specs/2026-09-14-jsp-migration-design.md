# React 게시판 → Spring Boot + JSP 마이그레이션 설계

## 배경

`apps/web`(React + Vite)과 `apps/api`(json-server)로 구성된 "개발 미션 게시판"은
인턴 과제용 저장소로, 저장소에는 **평가 기준이 되는 정적 UI 퍼블리싱**만 존재한다.
현재 커밋 상태 기준으로:

- `PostList.jsx`: `fetchList`를 호출하지만 결과를 화면에 전혀 사용하지 않는다.
  목록은 10개 항목이 JSX에 하드코딩되어 있다.
- `PostDetail.jsx`: `fetchPost`/`fetchComment`로 실제 데이터를 불러와 렌더링한다.
  삭제 버튼, 댓글 등록 버튼, 삭제 확인 Dialog는 전부 비활성/미동작 상태다.
- `PostForm.jsx`: 전부 정적 마크업이다. 글자 수 표시는 고정 텍스트(`0/100자` 등)이고
  등록 버튼은 `disabled`, 이탈 확인 Dialog는 비활성 상태다.
- 로고/글쓰기 링크, 상세→목록 back-link는 React Router로 실제 이동이 동작한다.

목표는 이 화면과 동작을 **새로 완성하지 않고 지금 보이는 그대로** Java(Spring Boot) +
JSP로 재현하는 것이다. 즉 목록의 하드코딩된 항목, 상세의 비활성 버튼, 작성 폼의
고정 글자 수 표시, 동작하지 않는 Dialog까지 전부 그대로 옮긴다.

## 결정 사항 (사용자 확인 완료)

- 새 프로젝트는 `apps/server/`에 단일 Spring Boot 앱으로 만든다
  (REST API 레이어 없이 컨트롤러가 JSP에 직접 데이터를 넘긴다).
- 기존 `apps/web`, `apps/api`는 삭제하지 않고 그대로 보존한다.
- 빌드 도구는 Gradle을 사용한다.
- 데이터는 DB 없이, 앱 기동 시 `db.json`을 그대로 읽어 메모리에 로드한다
  (재시작하면 json-server처럼 초기 상태로 리셋됨).

## 프로젝트 구조

```text
apps/server/
├── build.gradle
├── settings.gradle
└── src/main/
    ├── java/board/
    │   ├── BoardApplication.java
    │   ├── BoardController.java       # /, /posts/{id}, /posts/{id}/edit, /write
    │   ├── Post.java, Comment.java, Writer.java   # 데이터 모델 (record 또는 POJO)
    │   └── BoardDataStore.java        # db.json 로드 + 조회만 제공 (In-memory)
    ├── resources/
    │   ├── db.json                    # apps/api/db.json 복사본
    │   ├── application.properties     # 포트, JSP 뷰 리졸버 설정
    │   └── static/
    │       └── styles.css             # apps/web/src/styles.css 복사본
    └── webapp/WEB-INF/views/
        ├── header.jsp                 # AppHeader.jsx 대응, JSP include
        ├── list.jsp                   # PostList.jsx 대응
        ├── detail.jsp                 # PostDetail.jsx 대응
        └── form.jsp                   # PostForm.jsx 대응
```

war 패키징 + 내장 Tomcat(`spring-boot-starter-tomcat` + `tomcat-embed-jasper`)으로
JSP를 서빙한다. 의존성: `spring-boot-starter-web`, `tomcat-embed-jasper`, `jstl`.

## 라우팅 매핑

| 메서드/경로 | 컨트롤러 동작 | 뷰 |
|---|---|---|
| `GET /` | 없음 (정적 목록이므로 모델 불필요) | `list.jsp` |
| `GET /posts/{id}` | `BoardDataStore`에서 post, comments 조회 후 모델에 추가 | `detail.jsp` |
| `GET /posts/{id}/edit` | 없음 (폼 자체가 정적이므로 값 채움 없음, 현재 React와 동일) | `form.jsp` |
| `GET /write` | 없음 | `form.jsp` |

`/posts/{id}/edit`도 현재 `PostForm.jsx`가 수정 모드 여부와 무관하게 완전히 동일한
정적 마크업을 그리므로(기존 값 채움 로직 없음), `/write`와 같은 뷰·모델을 그대로 쓴다.

## 데이터 계층

`BoardDataStore`는 앱 기동 시 `resources/db.json`을 Jackson `ObjectMapper`로 파싱해
`List<Post>`와 `List<Comment>`를 필드로 들고 있는 싱글턴 빈이다. 제공 메서드는
`findPostById(long id)`, `findCommentsByPostId(long id)` 두 개뿐 — 지금 화면이 조회만
하므로 그 이상은 만들지 않는다. Repository/Service 계층 분리는 하지 않는다
(컨트롤러가 `BoardDataStore`를 직접 호출).

## 화면별 변환 규칙

### header.jsp (공통, 모든 뷰에서 include)
`AppHeader.jsx`를 그대로 옮긴다. 로고는 `<a href="/">`, 검색 input은 `readonly` 유지,
글쓰기는 `<a href="/write">`로 실제 이동(현재 React와 동일하게 동작하는 부분).

### list.jsp
`PostList.jsx`의 JSX가 그대로 하드코딩된 마크업이므로 그 마크업을 그대로 JSP로 옮긴다.
`fetchList` 호출처럼 화면에 영향 없는 코드는 포팅하지 않는다. 상단 필터 탭, 정렬
select, 페이지네이션은 지금처럼 전부 비활성/정적 상태로 둔다.

### detail.jsp
컨트롤러가 넘긴 `post`, `comments` 모델을 JSTL(`<c:out>`, `<c:forEach>`)로 출력한다.
`post.title`, `post.writer.nickName`, `post.writer.firstName`, `post.createdAt`,
`post.viewCount`, `post.content`, 댓글 목록을 지금 JSX와 동일한 구조로 렌더링한다.
삭제 버튼, 댓글 등록 버튼(`disabled`), 삭제 확인 Dialog(비표시 상태 마크업)는 지금과
동일하게 비활성 상태로 옮긴다.

### form.jsp
`PostForm.jsx`를 그대로 옮긴다. 제목/닉네임/내용 입력, 고정 글자 수 텍스트
(`0 / 100자` 등), 등록 버튼 `disabled`, 이탈 확인 Dialog(비표시 마크업) 전부 정적으로
유지한다. 작성 모드/수정 모드 구분 없이 동일한 뷰를 사용한다(현재 React와 동일).

### 옮기지 않는 것
`ContentState.jsx`와 skeleton 컴포넌트는 현재 어떤 화면에서도 사용되지 않으므로
포팅하지 않는다. 필요해지면 그때 추가한다.

## 스타일/에셋

- `styles.css`를 그대로 `static/styles.css`로 복사, 각 JSP `<head>`에서 링크.
- Pretendard 폰트는 지금과 동일하게 CDN(`cdn.jsdelivr.net`) 링크 유지.
- PrimeReact 테마 CSS는 불필요 — `styles.css`가 `.p-button`, `.p-dialog`,
  `.p-inputtext` 등을 이미 전부 커스텀 스타일링하고 있어 클래스명만 그대로 쓰면
  동일하게 보인다.
- PrimeIcons(`pi pi-*` 아이콘 폰트)만 CDN CSS 링크로 대체
  (`cdnjs.cloudflare.com/ajax/libs/primeicons`).
- `favicon.svg`를 `apps/web/public/favicon.svg`에서 `static/`으로 복사.

## 검증 방법

자동화 테스트 없이 수동 시각 비교로 검증한다(정적 뷰 미러링이므로 스냅샷 비교가
전부이고 자동 테스트는 과함):

1. `./gradlew bootRun`으로 기동.
2. `/`, `/posts/1`, `/posts/1/edit`, `/write`를 브라우저로 열어 기존 `pnpm dev`로 띄운
   React 앱과 나란히 비교(레이아웃, 텍스트, 비활성 버튼 상태 일치 확인).
3. 320px / 768px / 1280px 폭에서 반응형 깨짐이 없는지 확인.

## 범위 밖

- 검색/필터/정렬/페이지네이션 동작 구현
- 게시글·댓글 작성/수정/삭제 실제 동작
- 유효성 검사, 로딩/에러 상태 처리
- Dialog 열기/닫기, focus 관리

이 저장소의 "미션" 성격을 유지하기 위해 위 항목은 React 버전과 마찬가지로
미구현 상태로 남긴다.
