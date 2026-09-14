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
