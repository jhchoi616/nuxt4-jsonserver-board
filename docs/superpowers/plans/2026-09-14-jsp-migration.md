# React 게시판 → Spring Boot + JSP 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/web`(React) + `apps/api`(json-server) 게시판을 `apps/server/`에 새 Gradle 기반 Spring Boot + JSP 프로젝트로, 지금 화면에 보이는 그대로(정적 목록, 비활성 버튼, 렌더링되지 않는 Dialog 포함) 재현한다.

**Architecture:** 단일 Spring Boot 앱(war 패키징 + 내장 Tomcat/Jasper)이 `BoardController`에서 JSP 뷰로 직접 모델을 넘긴다. REST API 레이어는 없다. 데이터는 DB 없이 앱 기동 시 `db.json`을 Jackson으로 파싱해 메모리에 올린 `BoardDataStore` 하나가 담당한다.

**Tech Stack:** Java 25, Spring Boot 4.1.1 (Gradle), `spring-boot-starter-webmvc`, `tomcat-embed-jasper`, JSTL(`jakarta.servlet.jsp.jstl-api` 3.0.2 / `org.glassfish.web:jakarta.servlet.jsp.jstl` 3.0.1), Jackson(웹 스타터에 포함).

**Spec:** `docs/superpowers/specs/2026-09-14-jsp-migration-design.md`

## Global Constraints

- 새 프로젝트는 `apps/server/`에 생성한다. 기존 `apps/web`, `apps/api`는 수정하거나 삭제하지 않는다.
- REST API 레이어를 따로 만들지 않는다. 컨트롤러가 `BoardDataStore`를 직접 호출해 JSP 모델에 데이터를 채운다.
- 데이터는 DB 없이 `db.json`을 앱 기동 시 메모리로 로드한다(재시작하면 초기 상태로 리셋).
- 화면은 "지금 보이는 그대로" 옮긴다: `list.jsp`는 하드코딩된 10개 항목, `detail.jsp`의 삭제/댓글 버튼과 `form.jsp`의 등록 버튼은 지금처럼 비활성 상태, React `<Dialog visible={false}>`는 실제로 DOM에 렌더링되지 않으므로 JSP에도 옮기지 않는다(각 위치에 JSP 주석으로만 표시).
- `styles.css`는 이미 `.p-button`/`.p-dialog`/`.p-inputtext`를 전부 커스텀 스타일링하므로 PrimeReact 테마 CSS는 가져오지 않는다. PrimeIcons만 CDN CSS로 추가한다.
- 자동화 테스트는 최소한으로 — 뷰 렌더링은 `curl` 기반 수동 검증으로 확인하고(스펙의 결정), `BoardDataStore`의 JSON 파싱/조회 로직에만 JUnit 테스트를 둔다(분기 있는 로직이라 ponytail 기준 최소 1개 체크 필요).
- 이 저장소는 미완성 상태를 유지하는 "미션" 저장소다. 검색·필터·정렬·페이지네이션·CRUD·유효성 검사·Dialog 동작을 새로 구현하지 않는다.
- Spring Initializr가 프로젝트명 `server`로 생성하면서 메인 클래스명을 `ServerApplication`으로 만든다. 스펙 문서의 예시 이름(`BoardApplication`)과 다르지만 동작에 영향이 없으므로 그대로 사용한다(불필요한 리네이밍 생략).

---

## Task 1: Gradle/Spring Boot 스캐폴드 + 목록 화면(`GET /`)

**Files:**
- Create: `apps/server/` 전체 Spring Initializr 스캐폴드 (`build.gradle`, `settings.gradle`, `gradlew`, `gradlew.bat`, `gradle/wrapper/*`, `src/main/java/board/ServerApplication.java`, `src/main/java/board/ServletInitializer.java`, `.gitignore`, `.gitattributes`)
- Modify: `apps/server/build.gradle` (JSP/JSTL 의존성 + Java 25 툴체인 추가)
- Modify: `apps/server/src/main/resources/application.properties` (JSP 뷰 리졸버 설정)
- Delete: `apps/server/HELP.md`, `apps/server/src/test/java/board/ServerApplicationTests.java` (Task 2에서 우리 테스트로 대체)
- Create: `apps/server/src/main/java/board/BoardController.java`
- Create: `apps/server/src/main/webapp/WEB-INF/views/_head.jsp`
- Create: `apps/server/src/main/webapp/WEB-INF/views/_foot.jsp`
- Create: `apps/server/src/main/webapp/WEB-INF/views/header.jsp`
- Create: `apps/server/src/main/webapp/WEB-INF/views/list.jsp`
- Create: `apps/server/src/main/resources/static/styles.css` (← `apps/web/src/styles.css` 복사)
- Create: `apps/server/src/main/resources/static/favicon.svg` (← `apps/web/public/favicon.svg` 복사)

**Interfaces:**
- Produces: `GET /` → 뷰 이름 `"list"` (Task 3, 4에서 `BoardController`에 메서드를 추가할 때 같은 클래스를 확장한다)
- Produces: JSP 공통 레이아웃 `_head.jsp`/`_foot.jsp`/`header.jsp` — Task 3, 4의 `detail.jsp`/`form.jsp`가 동일한 방식(`<%@ include file="_head.jsp" %>` … `<%@ include file="_foot.jsp" %>`)으로 재사용한다.

- [ ] **Step 1: Spring Initializr로 프로젝트 스캐폴드 생성**

```bash
cd /c/src/mission/board/apps
curl -s "https://start.spring.io/starter.zip?type=gradle-project&language=java&packaging=war&javaVersion=25&groupId=board&artifactId=server&name=server&packageName=board&dependencies=web&baseDir=." -o server.zip
mkdir -p server
unzip -o -q server.zip -d server
rm server.zip
chmod +x server/gradlew
rm server/HELP.md server/src/test/java/board/ServerApplicationTests.java
```

- [ ] **Step 2: `build.gradle`을 JSP 지원 버전으로 교체**

`apps/server/build.gradle` 전체를 다음 내용으로 교체한다:

```gradle
plugins {
	id 'java'
	id 'war'
	id 'org.springframework.boot' version '4.1.1'
	id 'io.spring.dependency-management' version '1.1.7'
}

group = 'board'
version = '0.0.1-SNAPSHOT'

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-webmvc'
	providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat-runtime'
	implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'
	implementation 'jakarta.servlet.jsp.jstl:jakarta.servlet.jsp.jstl-api:3.0.2'
	implementation 'org.glassfish.web:jakarta.servlet.jsp.jstl:3.0.1'
	testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
	testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
	useJUnitPlatform()
}
```

- [ ] **Step 3: `application.properties`에 JSP 뷰 리졸버 설정 추가**

`apps/server/src/main/resources/application.properties` 전체를 다음으로 교체한다:

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
server.port=8080
```

- [ ] **Step 4: `BoardController` 생성 (목록 라우트만)**

`apps/server/src/main/java/board/BoardController.java`:

```java
package board;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BoardController {

    @GetMapping("/")
    public String list() {
        return "list";
    }
}
```

- [ ] **Step 5: 공통 레이아웃 fragment 작성**

`apps/server/src/main/webapp/WEB-INF/views/_head.jsp`:

```jsp
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="<c:url value='/favicon.svg'/>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="<c:url value='/styles.css'/>" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/primeicons/7.0.0/primeicons.min.css" />
    <meta name="description" content="개발 미션 중 생긴 질문과 해결 방법을 나누는 게시판" />
    <title>질문과 해결 방법 · 개발 미션 게시판</title>
  </head>
  <body>
    <div id="app">
      <%@ include file="header.jsp" %>
      <main id="main" tabindex="-1" class="shell page">
```

`apps/server/src/main/webapp/WEB-INF/views/_foot.jsp`:

```jsp
      </main>
    </div>
  </body>
</html>
```

`apps/server/src/main/webapp/WEB-INF/views/header.jsp` (`AppHeader.jsx` 대응):

```jsp
    <header class="site-header">
      <div class="shell header-inner">
        <a href="<c:url value='/'/>">
        <div class="logo">
          <span class="logo-mark" aria-hidden="true">M</span>
          <span class="logo-copy"><strong>개발 미션 게시판</strong></span>
        </div>
        </a>

        <div class="header-actions">
          <div class="search">
            <i class="pi pi-search" aria-hidden="true"></i>
            <input
              type="search"
              class="p-inputtext"
              placeholder="질문이나 해결 방법 검색"
              aria-label="게시글 검색"
              readonly
            />
          </div>
          <a href="<c:url value='/write'/>">
          <span class="p-button header-write is-static">
            <i class="pi pi-plus" aria-hidden="true"></i>
            <span>글쓰기</span>
          </span>
          </a>
        </div>
      </div>
    </header>
```

- [ ] **Step 6: `list.jsp` 작성 (`PostList.jsx` 1:1 이식)**

`apps/server/src/main/webapp/WEB-INF/views/list.jsp`:

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="_head.jsp" %>

      <section class="page-intro" aria-labelledby="board-title">
        <div>
          <h1 class="page-title" id="board-title">질문과 해결 방법</h1>
          <p class="page-description">
            미션을 진행하며 생긴 질문과 해결한 방법을 나눠보세요.
          </p>
        </div>
      </section>

      <section class="board-panel" aria-label="게시글 목록">
        <div class="board-toolbar">
          <div class="tabs" role="group" aria-label="게시글 필터">
            <button type="button" class="tab is-active" aria-pressed="true">전체</button>
            <button type="button" class="tab" aria-pressed="false">공지</button>
          </div>
          <div class="toolbar-meta">
            <p class="result-count">10개의 글</p>
            <label class="sort-control">
              <span class="sr-only">게시글 정렬</span>
              <select>
                <option selected>최신순</option>
                <option>조회순</option>
              </select>
              <i class="pi pi-chevron-down" aria-hidden="true"></i>
            </label>
          </div>
        </div>

        <div class="card card--list">
          <ul class="post-list">
            <li class="post-item is-notice">
              <div class="post-item-body">
                <div class="post-item-head">
                  <span class="pill-notice">공지</span>
                  <h2 class="post-item-title"><span>공지사항 먼저 읽고 미션 시작해주세요</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">운영자</span>
                  <span class="sep"></span>
                  <span>8월 12일</span>
                  <span class="sep"></span>
                  <span>조회 351</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  0
                </span>
              </div>
            </li>

            <li class="post-item is-notice">
              <div class="post-item-body">
                <div class="post-item-head">
                  <span class="pill-notice">공지</span>
                  <h2 class="post-item-title"><span>이번 주 코드 리뷰 일정 안내</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">운영자</span>
                  <span class="sep"></span>
                  <span>8월 11일</span>
                  <span class="sep"></span>
                  <span>조회 324</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  3
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>게시판 미션 진행 중 막히는 부분 공유합니다</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자1</span>
                  <span class="sep"></span>
                  <span>8월 10일</span>
                  <span class="sep"></span>
                  <span>조회 297</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  2
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>페이지네이션 쿼리는 어떻게 넘기시나요?</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자5</span>
                  <span class="sep"></span>
                  <span>8월 9일</span>
                  <span class="sep"></span>
                  <span>조회 270</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  5
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>테이블에 정렬 붙이는 방법 정리했습니다</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자4</span>
                  <span class="sep"></span>
                  <span>8월 8일</span>
                  <span class="sep"></span>
                  <span>조회 243</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  0
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>상세 화면에서 새로고침하면 내용이 사라져요</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자3</span>
                  <span class="sep"></span>
                  <span>8월 7일</span>
                  <span class="sep"></span>
                  <span>조회 216</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  1
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>작성 폼 유효성 검사 어디까지 하셨어요?</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자2</span>
                  <span class="sep"></span>
                  <span>8월 6일</span>
                  <span class="sep"></span>
                  <span>조회 189</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  2
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>json-server 응답 구조 정리해봤습니다</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자1</span>
                  <span class="sep"></span>
                  <span>8월 5일</span>
                  <span class="sep"></span>
                  <span>조회 162</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  4
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>모바일에서 목록이 잘리는 현상 해결했습니다</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자5</span>
                  <span class="sep"></span>
                  <span>8월 4일</span>
                  <span class="sep"></span>
                  <span>조회 135</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  0
                </span>
              </div>
            </li>

            <li class="post-item">
              <div class="post-item-body">
                <div class="post-item-head">
                  <h2 class="post-item-title"><span>처음 세팅할 때 참고한 문서 모음</span></h2>
                </div>
                <div class="post-item-meta">
                  <span class="post-author">작성자4</span>
                  <span class="sep"></span>
                  <span>8월 3일</span>
                  <span class="sep"></span>
                  <span>조회 108</span>
                </div>
              </div>
              <div class="post-item-side">
                <span class="reply-count has-replies">
                  <i class="pi pi-comment" aria-hidden="true"></i>
                  <span class="sr-only">댓글 </span>
                  1
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <div class="pager" aria-label="페이지 이동 UI">
        <span class="is-disabled" aria-hidden="true"><i class="pi pi-chevron-left"></i></span>
        <span class="is-static" aria-current="page">1</span>
        <span class="is-static">2</span>
        <span class="is-static">3</span>
        <span class="is-static" aria-label="다음 페이지"><i class="pi pi-chevron-right" aria-hidden="true"></i></span>
      </div>

<%@ include file="_foot.jsp" %>
```

- [ ] **Step 7: 정적 자산 복사**

```bash
cd /c/src/mission/board
mkdir -p apps/server/src/main/resources/static
cp apps/web/src/styles.css apps/server/src/main/resources/static/styles.css
cp apps/web/public/favicon.svg apps/server/src/main/resources/static/favicon.svg
```

- [ ] **Step 8: 실행해서 목록 화면 확인**

```bash
cd /c/src/mission/board/apps/server
./gradlew bootRun --console=plain > /tmp/bootrun-task1.log 2>&1 &
```

앱이 뜰 때까지 기다렸다가(약 5~15초, `tail -f` 또는 `curl` 재시도) 확인:

```bash
curl -s http://localhost:8080/ | grep "질문과 해결 방법"
curl -s http://localhost:8080/ | grep "공지사항 먼저 읽고 미션 시작해주세요"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/styles.css
```

Expected: 두 `grep` 모두 매칭되는 줄을 출력하고, `styles.css` 요청은 `200`을 반환한다.

- [ ] **Step 9: 프로세스 종료**

```bash
# Windows: netstat -ano | grep ':8080' | grep LISTENING 로 PID 확인 후
taskkill //PID <PID> //F
```

- [ ] **Step 10: 커밋**

```bash
cd /c/src/mission/board
git add apps/server
git commit -m "$(cat <<'EOF'
feat: Spring Boot + JSP 스캐폴드와 목록 화면 이식

apps/server에 Gradle 기반 Spring Boot(war+Jasper) 프로젝트를 새로 만들고
PostList.jsx의 정적 마크업을 list.jsp로 그대로 옮긴다.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014tnRxRZ7dk3oE7emHLCJFy
EOF
)"
```

---

## Task 2: 데이터 계층 (`db.json` 로드 + 조회)

**Files:**
- Create: `apps/server/src/main/resources/db.json` (← `apps/api/db.json` 복사)
- Create: `apps/server/src/main/java/board/Writer.java`
- Create: `apps/server/src/main/java/board/Post.java`
- Create: `apps/server/src/main/java/board/Comment.java`
- Create: `apps/server/src/main/java/board/BoardDataStore.java`
- Create: `apps/server/src/test/java/board/BoardDataStoreTest.java`

**Interfaces:**
- Consumes: 없음 (독립 계층)
- Produces: `BoardDataStore.findPostById(long id): Post` (없으면 `null`), `BoardDataStore.findCommentsByPostId(long id): List<Comment>` (없으면 빈 리스트) — Task 3의 `BoardController.detail()`이 그대로 호출한다. `Post`는 `id, title, type, content, viewCount, writer, writerId, createdAt` 컴포넌트를 가진 record, `Writer`는 `nickName, firstName`, `Comment`는 `id, postsId, writer, writerId, content, createdAt`.

- [ ] **Step 1: `db.json` 복사**

```bash
cd /c/src/mission/board
cp apps/api/db.json apps/server/src/main/resources/db.json
```

- [ ] **Step 2: 데이터 모델 record 작성**

`apps/server/src/main/java/board/Writer.java`:

```java
package board;

public record Writer(String nickName, String firstName) {
}
```

`apps/server/src/main/java/board/Post.java`:

```java
package board;

public record Post(
    long id,
    String title,
    int type,
    String content,
    int viewCount,
    Writer writer,
    long writerId,
    String createdAt
) {
}
```

`apps/server/src/main/java/board/Comment.java`:

```java
package board;

public record Comment(
    long id,
    long postsId,
    Writer writer,
    long writerId,
    String content,
    String createdAt
) {
}
```

- [ ] **Step 3: 실패하는 테스트 작성**

`apps/server/src/test/java/board/BoardDataStoreTest.java`:

```java
package board;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BoardDataStoreTest {

    private final BoardDataStore store = new BoardDataStore();

    @Test
    void findsPostById() {
        Post post = store.findPostById(1);

        assertThat(post).isNotNull();
        assertThat(post.title()).isEqualTo("공지사항");
        assertThat(post.writer().nickName()).isEqualTo("운영자");
    }

    @Test
    void returnsNullWhenPostNotFound() {
        assertThat(store.findPostById(999)).isNull();
    }

    @Test
    void findsCommentsByPostId() {
        List<Comment> comments = store.findCommentsByPostId(1);

        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).content()).isEqualTo("공지사항 감사합니다.");
    }
}
```

- [ ] **Step 4: 테스트가 실패하는지 확인 (컴파일 실패)**

```bash
cd /c/src/mission/board/apps/server
./gradlew test --console=plain
```

Expected: `BoardDataStore` 클래스가 없어 컴파일 에러로 FAIL.

- [ ] **Step 5: `BoardDataStore` 구현**

`apps/server/src/main/java/board/BoardDataStore.java`:

```java
package board;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Component
public class BoardDataStore {

    private final List<Post> posts;
    private final List<Comment> comments;

    public BoardDataStore() {
        try (InputStream dbJson = getClass().getResourceAsStream("/db.json")) {
            Db db = new ObjectMapper().readValue(dbJson, Db.class);
            this.posts = db.posts();
            this.comments = db.comments();
        } catch (IOException e) {
            throw new IllegalStateException("db.json을 읽지 못했습니다", e);
        }
    }

    public Post findPostById(long id) {
        return posts.stream()
            .filter(post -> post.id() == id)
            .findFirst()
            .orElse(null);
    }

    public List<Comment> findCommentsByPostId(long id) {
        return comments.stream()
            .filter(comment -> comment.postsId() == id)
            .toList();
    }

    private record Db(List<Post> posts, List<Comment> comments) {
    }
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
cd /c/src/mission/board/apps/server
./gradlew test --console=plain
```

Expected: `BoardDataStoreTest`의 3개 테스트 모두 PASS.

- [ ] **Step 7: 커밋**

```bash
cd /c/src/mission/board
git add apps/server
git commit -m "$(cat <<'EOF'
feat: db.json 기반 인메모리 데이터 계층 추가

BoardDataStore가 기동 시 db.json을 읽어 게시글/댓글을 메모리에 올리고
id 기준 조회만 제공한다. DB나 Repository 계층 없이 컨트롤러가 직접 사용한다.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014tnRxRZ7dk3oE7emHLCJFy
EOF
)"
```

---

## Task 3: 상세 화면 (`GET /posts/{id}`)

**Files:**
- Modify: `apps/server/src/main/java/board/BoardController.java`
- Create: `apps/server/src/main/webapp/WEB-INF/views/detail.jsp`

**Interfaces:**
- Consumes: `BoardDataStore.findPostById(long)`, `BoardDataStore.findCommentsByPostId(long)` (Task 2), `_head.jsp`/`_foot.jsp` 레이아웃 (Task 1)
- Produces: `GET /posts/{id}` → 뷰 `"detail"`, 모델 속성 `post`(`Post`, 없으면 null), `comments`(`List<Comment>`)

- [ ] **Step 1: `BoardController`에 상세 라우트 추가**

`apps/server/src/main/java/board/BoardController.java` 전체를 다음으로 교체한다:

```java
package board;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class BoardController {

    private final BoardDataStore dataStore;

    public BoardController(BoardDataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping("/")
    public String list() {
        return "list";
    }

    @GetMapping("/posts/{id}")
    public String detail(@PathVariable long id, Model model) {
        model.addAttribute("post", dataStore.findPostById(id));
        model.addAttribute("comments", dataStore.findCommentsByPostId(id));
        return "detail";
    }
}
```

- [ ] **Step 2: `detail.jsp` 작성 (`PostDetail.jsx` 1:1 이식)**

`apps/server/src/main/webapp/WEB-INF/views/detail.jsp`:

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ include file="_head.jsp" %>

      <a href="<c:url value='/'/>">
        <span class="back-link is-static">
          <i class="pi pi-chevron-left" aria-hidden="true"></i>
          전체 글로
        </span>
      </a>

      <c:if test="${post != null}">
      <article class="card article-card">
        <h1 class="page-title article-title"><c:out value="${post.title}" /></h1>

        <div class="post-head">
          <div class="author">
            <span class="author-face" aria-hidden="true"><c:out value="${post.writer.firstName}" /></span>
            <div>
              <div class="author-name"><c:out value="${post.writer.nickName}" /></div>
              <div class="author-date"><c:out value="${post.createdAt}" /></div>
            </div>
          </div>
          <div class="stat-row">
            <span aria-label="조회 ${post.viewCount}회">
              <i class="pi pi-eye" aria-hidden="true"></i>
              <c:out value="${post.viewCount}" />
            </span>
            <span aria-label="댓글 ${fn:length(comments)}개">
              <i class="pi pi-comment" aria-hidden="true"></i>
              <c:out value="${fn:length(comments)}" />
            </span>
          </div>
        </div>

        <hr class="rule" />

        <div class="post-body"><c:out value="${post.content}" /></div>

        <div class="post-actions">
          <button type="button" class="p-button p-button-danger is-static">
            <i class="pi pi-trash" aria-hidden="true"></i>
            <span>글 삭제</span>
          </button>
          <span class="p-button p-button-secondary is-static">
            <i class="pi pi-pencil" aria-hidden="true"></i>
            <span>글 수정</span>
          </span>
        </div>
      </article>
      </c:if>

      <section class="card comments-card">
        <div class="section-heading">
          <div>
            <h2 class="section-title">댓글 ${fn:length(comments)}개</h2>
            <p>답변이나 참고 자료를 나누면 더 빨리 해결할 수 있어요.</p>
          </div>
        </div>

        <ul class="comment-list">
          <c:forEach var="comment" items="${comments}">
          <li class="comment">
            <span class="comment-face" aria-hidden="true"><c:out value="${comment.writer.firstName}" /></span>
            <div>
              <div class="author-name">
                <c:out value="${comment.writer.nickName}" />
                <span class="author-date comment-when"><c:out value="${comment.createdAt}" /></span>
              </div>
              <p class="comment-text"><c:out value="${comment.content}" /></p>
            </div>
          </li>
          </c:forEach>
        </ul>

        <form class="comment-form field">
          <label class="field-label" for="comment">댓글 작성</label>
          <textarea id="comment" class="p-inputtext" rows="3" placeholder="해결 방법이나 참고 자료를 알려주세요"></textarea>
          <div class="row-end">
            <button type="button" class="p-button" disabled>댓글 등록</button>
          </div>
        </form>
      </section>

      <%-- 퍼블리싱된 삭제 확인 UI. visible 상태와 이벤트는 인턴이 구현한다.
           원본 React Dialog는 visible={false}로 항상 렌더링되지 않으므로 마크업을 옮기지 않는다. --%>

<%@ include file="_foot.jsp" %>
```

- [ ] **Step 3: 실행해서 상세 화면 확인**

```bash
cd /c/src/mission/board/apps/server
./gradlew bootRun --console=plain > /tmp/bootrun-task3.log 2>&1 &
```

기동 후:

```bash
curl -s http://localhost:8080/posts/1 | grep "공지사항"
curl -s http://localhost:8080/posts/1 | grep "공지사항 감사합니다"
curl -s http://localhost:8080/posts/1 | grep -c "p-dialog"
```

Expected: 앞 두 `grep`은 매칭 줄을 출력하고(제목, 댓글 내용), 세 번째 `grep -c`는 `0`을 출력한다(Dialog 마크업이 없어야 함).

- [ ] **Step 4: 프로세스 종료**

```bash
# netstat -ano | grep ':8080' | grep LISTENING 으로 PID 확인 후
taskkill //PID <PID> //F
```

- [ ] **Step 5: 커밋**

```bash
cd /c/src/mission/board
git add apps/server
git commit -m "$(cat <<'EOF'
feat: 상세 화면(/posts/{id}) 이식

PostDetail.jsx를 detail.jsp로 옮긴다. 삭제/댓글 등록 버튼은 지금처럼
비활성 상태로, visible=false라 실제로 렌더링되지 않던 삭제 확인 Dialog는
마크업을 옮기지 않는다.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014tnRxRZ7dk3oE7emHLCJFy
EOF
)"
```

---

## Task 4: 작성/수정 화면 (`GET /write`, `GET /posts/{id}/edit`) + 전체 검증

**Files:**
- Modify: `apps/server/src/main/java/board/BoardController.java`
- Create: `apps/server/src/main/webapp/WEB-INF/views/form.jsp`

**Interfaces:**
- Consumes: `_head.jsp`/`_foot.jsp` 레이아웃 (Task 1)
- Produces: `GET /write`, `GET /posts/{id}/edit` → 뷰 `"form"` (모델 없음, 완전 정적)

- [ ] **Step 1: `BoardController`에 작성/수정 라우트 추가**

`apps/server/src/main/java/board/BoardController.java`의 `detail` 메서드 아래에 추가:

```java
    @GetMapping("/posts/{id}/edit")
    public String edit() {
        return "form";
    }

    @GetMapping("/write")
    public String write() {
        return "form";
    }
```

(클래스 상단 import는 Task 3와 동일하게 유지, 추가 import 없음)

- [ ] **Step 2: `form.jsp` 작성 (`PostForm.jsx` 1:1 이식)**

`apps/server/src/main/webapp/WEB-INF/views/form.jsp`:

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="_head.jsp" %>

      <span class="back-link is-static">
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
        전체 글로
      </span>

      <section class="page-intro page-intro--compact">
        <div>
          <h1 class="page-title">새 글 작성</h1>
          <p class="page-description">질문이나 해결 방법을 작성하면 목록에 바로 보여요.</p>
        </div>
      </section>

      <div class="write-layout">
        <form class="card form-card">
          <div class="field">
            <label class="field-label" for="title">
              제목
              <span class="req" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              class="p-inputtext"
              placeholder="예: 페이지네이션 쿼리는 어떻게 넘기시나요?"
              aria-describedby="title-count"
            />
            <div class="field-foot">
              <span class="field-hint" id="title-count">0 / 100자</span>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="author">
              닉네임
              <span class="req" aria-hidden="true">*</span>
            </label>
            <input
              id="author"
              class="p-inputtext"
              placeholder="목록에 표시될 이름"
              aria-describedby="author-count"
            />
            <div class="field-foot">
              <span class="field-hint" id="author-count">0 / 20자</span>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="content">
              내용
              <span class="req" aria-hidden="true">*</span>
            </label>
            <textarea
              id="content"
              class="p-inputtext"
              rows="12"
              placeholder="막힌 부분, 시도해본 방법, 궁금한 점을 차례로 적어보세요"
              aria-describedby="content-count"
            ></textarea>
            <div class="field-foot">
              <span class="field-hint" id="content-count">0 / 2,000자</span>
            </div>
          </div>

          <div class="form-footer">
            <span class="p-button p-button-help btn-xl is-static">작성 취소</span>
            <button type="button" class="p-button btn-xl" disabled>
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>글 등록</span>
            </button>
          </div>
        </form>

        <aside class="writing-guide" aria-labelledby="writing-guide-title">
          <span class="guide-icon" aria-hidden="true"><i class="pi pi-lightbulb"></i></span>
          <h2 id="writing-guide-title">답변받기 좋은 글</h2>
          <ul>
            <li>문제가 생긴 상황을 먼저 알려주세요.</li>
            <li>이미 시도한 방법을 함께 적어주세요.</li>
            <li>개인정보는 글에 남기지 마세요.</li>
          </ul>
        </aside>
      </div>

      <%-- 퍼블리싱된 이탈 확인 UI. visible 상태와 이벤트는 인턴이 구현한다.
           원본 React Dialog는 visible={false}로 항상 렌더링되지 않으므로 마크업을 옮기지 않는다. --%>

<%@ include file="_foot.jsp" %>
```

- [ ] **Step 3: 실행해서 4개 라우트 전체 확인**

```bash
cd /c/src/mission/board/apps/server
./gradlew bootRun --console=plain > /tmp/bootrun-task4.log 2>&1 &
```

기동 후:

```bash
curl -s -o /dev/null -w "GET /            -> %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "GET /posts/1     -> %{http_code}\n" http://localhost:8080/posts/1
curl -s -o /dev/null -w "GET /posts/1/edit-> %{http_code}\n" http://localhost:8080/posts/1/edit
curl -s -o /dev/null -w "GET /write       -> %{http_code}\n" http://localhost:8080/write
curl -s http://localhost:8080/write | grep "새 글 작성"
curl -s http://localhost:8080/posts/1/edit | grep "새 글 작성"
```

Expected: 4개 라우트 모두 `200`, 마지막 두 `grep`도 매칭 줄을 출력한다.

이어서 브라우저(또는 Chrome 도구)로 `http://localhost:8080/`, `/posts/1`, `/write`를 열어 `apps/web`을 `pnpm dev`로 띄운 React 버전과 나란히 비교하고, 320px/768px/1280px 폭에서 레이아웃이 깨지지 않는지 확인한다(스펙의 검증 방법).

- [ ] **Step 4: 프로세스 종료**

```bash
# netstat -ano | grep ':8080' | grep LISTENING 으로 PID 확인 후
taskkill //PID <PID> //F
```

- [ ] **Step 5: 커밋**

```bash
cd /c/src/mission/board
git add apps/server
git commit -m "$(cat <<'EOF'
feat: 작성/수정 화면(/write, /posts/{id}/edit) 이식

PostForm.jsx를 form.jsp로 옮긴다. 글자 수, 등록 버튼, 이탈 확인 Dialog
모두 지금처럼 정적/비활성 상태를 유지한다. 이로써 목록·상세·작성·수정
4개 화면 전체가 Spring Boot + JSP로 이식 완료된다.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014tnRxRZ7dk3oE7emHLCJFy
EOF
)"
```
