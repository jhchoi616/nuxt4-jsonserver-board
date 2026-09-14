<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page pageEncoding="UTF-8" %>
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
