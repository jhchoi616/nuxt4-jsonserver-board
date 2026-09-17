// ============================================================================
// simple-guard.mjs
// ------------------------------------------------------------------------
// guard.mjs와 목적은 같습니다: "쓰기 요청(POST/PUT/PATCH/DELETE)은 내 프론트엔드
// 주소에서 온 것만 허용하고, 나머지(GET 등 읽기 요청)는 누구나 볼 수 있게 둔다."
//
// guard.mjs가 이해하기 어려웠던 이유는, 이 하나의 목적을 위해 낯선 개념 3가지를
// 한꺼번에 썼기 때문입니다.
//   1) child_process.spawn 으로 json-server를 "별도 프로세스"로 몰래 하나 더 실행
//   2) http.request 로 그 프로세스에 요청을 수동으로 복사해서 전달(=리버스 프록시)
//   3) POST 요청마다 중복 id 검사 + Promise 대기열(queue)로 순서 보장
//
// 이 파일은 그중 "정말 필요한 것"(위 목적 문장)만 남기고, 나머지는 다 뺐습니다.
// 그 결과 프로세스도 1개, 수동 프록시도 없습니다. 구조는 아래 4단계뿐입니다.
//   [1] db.json 파일을 읽어서 메모리에 올린다
//   [2] json-server의 원래 기능(라우팅, CORS 등)을 만든다 (createApp)
//   [3] 내가 직접 만드는 서버 안에서, 응답을 넘기기 전에 "이 요청 통과시켜도 되나?"만 검사한다
//   [4] 통과했으면 [2]에서 만든 json-server에게 그대로 맡긴다
//
// ⚠️ 뺀 기능: "POST 시 중복 id 검사 + 대기열" 은 여기 없습니다.
//    이건 "누가 요청을 보냈는가"가 아니라 "동시에 두 명이 글을 쓸 때 id가 겹치지
//    않게 하기"라는 별개의 문제라서, 이 파일의 목적(요청 제한)과는 다른 기능입니다.
//    필요해지면 guard.mjs의 해당 부분(serialized 함수)을 참고해서 따로 추가하세요.
// ============================================================================

import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
// json-server 패키지 자체엔 index.js가 없어서 `import ... from "json-server"`는
// 동작하지 않습니다(= server.mjs가 깨졌던 원인). 실제 코드가 들어있는 파일
// (lib/app.js)을 직접 가리켜야 합니다.
import { createApp } from "json-server/lib/app.js";

// ----------------------------------------------------------------------------
// [1] db.json을 메모리로 읽어오기
// ----------------------------------------------------------------------------
// createApp이 요구하는 "db 객체"의 규칙은 단 두 가지뿐입니다.
//   - db.data      : 실제 데이터가 담긴 객체 (posts, comments ... 배열들)
//   - db.write()   : "데이터가 바뀌었으니 파일에 저장해줘"를 수행하는 함수
// guard.mjs/bin.js는 이걸 위해 lowdb라는 라이브러리를 쓰지만, 우리는 이 규칙만
// 지키면 되므로 Node 기본 fs 모듈만으로 직접 만듭니다. (새 라이브러리 설치 불필요)
const DB_PATH = new URL("./db.json", import.meta.url);

const db = {
  data: JSON.parse(readFileSync(DB_PATH, "utf-8")),
  async write() {
    writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
  },
};

// ----------------------------------------------------------------------------
// [2] json-server 본체 만들기
// ----------------------------------------------------------------------------
// createApp(db)는 GET/POST/PUT/PATCH/DELETE 라우팅과 CORS 헤더 설정까지 전부
// 포함된 "요청 처리기"를 반환합니다. json-server db.json 명령을 실행했을 때와
// 내부적으로 완전히 같은 동작입니다.
const app = createApp(db);

// ----------------------------------------------------------------------------
// [3], [4] 문지기(guard) 서버
// ----------------------------------------------------------------------------
// 쓰기 메서드 목록
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// 허용할 프론트엔드 주소들. Render 대시보드 환경변수 WEB_ORIGIN에 콤마(,)로
// 구분해서 넣으면 됩니다. 예: "https://my-app.vercel.app,http://localhost:3500"
// 아무 값도 없으면 로컬 개발 주소만 허용합니다.
const ALLOWED_ORIGINS = (process.env.WEB_ORIGIN ?? "http://localhost:3500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PORT = process.env.PORT ?? 4100;

// createApp이 만들어준 app은 "요청을 어떻게 처리할지"를 알고 있을 뿐, 스스로
// 포트를 열지는 않습니다(app.listen()을 쓰면 그걸 대신 해줍니다). 우리는 그
// app.listen() 대신 http.createServer를 직접 써서, "app에게 요청을 넘기기
// 바로 전"에 한 줄짜리 검사를 끼워 넣습니다. 이게 이 파일의 핵심입니다.
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const isWriteRequest = WRITE_METHODS.has(req.method ?? "");
  const isFromAllowedOrigin = origin !== undefined && ALLOWED_ORIGINS.includes(origin);

  if (isWriteRequest && !isFromAllowedOrigin) {
    // 여기서 그냥 연결을 끊어버리면 브라우저 콘솔에는 "CORS error"라고만 뜨고
    // 진짜 이유(403으로 막혔다는 것)를 알 수 없습니다. 지금까지 겪은 CORS 문제가
    // 정확히 이런 유형이었으므로, 막을 때도 CORS 헤더와 이유를 같이 내려줍니다.
    res.writeHead(403, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin ?? "*",
    });
    res.end(
      JSON.stringify({
        error: "이 주소에서 보낸 쓰기 요청(POST/PUT/PATCH/DELETE)은 허용되지 않습니다.",
        allowedOrigins: ALLOWED_ORIGINS,
      }),
    );
    return;
  }

  // 통과: json-server 본체에게 그대로 맡깁니다.
  app.attach(req, res);
});

server.listen(PORT, () => {
  console.log(`[simple-guard] http://localhost:${PORT}`);
  console.log(`[simple-guard] 허용된 프론트엔드 주소: ${ALLOWED_ORIGINS.join(", ")}`);
});

// ----------------------------------------------------------------------------
// 직접 확인해보고 싶다면 (서버를 켜둔 상태에서 터미널에 입력):
//
//   # 1) 읽기는 항상 허용됨
//   curl http://localhost:4100/posts
//
//   # 2) 허용된 주소(Origin)에서 쓰기 -> 성공
//   curl -X POST http://localhost:4100/posts \
//     -H "Content-Type: application/json" \
//     -H "Origin: http://localhost:3500" \
//     -d '{"title":"test"}'
//
//   # 3) 허용되지 않은 주소에서 쓰기 -> 403 + 이유가 담긴 JSON
//   curl -i -X POST http://localhost:4100/posts \
//     -H "Content-Type: application/json" \
//     -H "Origin: https://someone-else.example.com" \
//     -d '{"title":"test"}'
// ----------------------------------------------------------------------------
