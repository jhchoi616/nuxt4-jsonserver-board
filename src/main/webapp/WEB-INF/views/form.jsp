<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="fragments/_head.jsp" %>

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

<%@ include file="fragments/_foot.jsp" %>
