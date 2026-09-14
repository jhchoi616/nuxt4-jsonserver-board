<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ include file="fragments/_head.jsp" %>

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

<%@ include file="fragments/_foot.jsp" %>
