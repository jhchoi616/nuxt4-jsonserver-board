# 개발 미션 게시판 (Spring Boot + JSP)

`react` 브랜치의 React + json-server 게시판을 Spring Boot + JSP로 마이그레이션한 버전입니다.
원본과 동일하게 목록은 정적 마크업이고, 상세 화면만 실제 데이터(`db.json`)를 읽어 렌더링하며,
글 작성·수정·댓글·삭제 등은 원본처럼 아직 구현되어 있지 않습니다.

마이그레이션 설계와 구현 계획은 `docs/superpowers/specs/2026-09-14-jsp-migration-design.md`,
`docs/superpowers/plans/2026-09-14-jsp-migration.md`에 정리되어 있습니다.

## 구조

```text
.
├── build.gradle
├── settings.gradle
├── gradlew, gradlew.bat
└── src/
    ├── main/
    │   ├── java/board/
    │   │   ├── ServerApplication.java   # 진입점
    │   │   ├── BoardController.java     # /, /posts/{id}, /posts/{id}/edit, /write
    │   │   ├── BoardDataStore.java      # db.json을 메모리에 로드, id로 조회만 제공
    │   │   ├── Post.java, Comment.java, Writer.java  # db.json에 대응하는 record
    │   │   └── ServletInitializer.java
    │   ├── resources/
    │   │   ├── db.json                  # 초기 게시글·댓글 데이터
    │   │   ├── application.properties
    │   │   └── static/                  # styles.css, favicon.svg
    │   └── webapp/WEB-INF/views/
    │       ├── _head.jsp, _foot.jsp, header.jsp  # 공통 레이아웃
    │       ├── list.jsp                 # 목록 (정적)
    │       ├── detail.jsp               # 상세 (db.json 기반)
    │       └── form.jsp                 # 작성·수정 (정적)
    └── test/java/board/BoardDataStoreTest.java
```

REST API 계층은 없습니다 — 컨트롤러가 `BoardDataStore`를 직접 호출해 JSP 모델에 데이터를 채웁니다.
데이터는 DB 없이 앱 기동 시 `db.json`을 읽어 메모리에 올리므로, 재시작하면 초기 상태로 리셋됩니다.

## 실행 방법

### 요구 환경

- JDK 21 이상 (Java 25에서 개발·확인)

```bash
./gradlew bootRun
```

- Web: `http://localhost:8080`

```bash
./gradlew test
```

## 화면

| 경로 | 설명 |
|---|---|
| `/` | 게시글 목록 (정적) |
| `/posts/{id}` | 게시글 상세 + 댓글 (db.json 조회) |
| `/write` | 새 글 작성 (정적) |
| `/posts/{id}/edit` | 글 수정 (정적, 작성 화면과 동일) |
