<%@ page pageEncoding="UTF-8" %>
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
