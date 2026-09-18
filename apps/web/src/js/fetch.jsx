import { act } from "react";
// Render 서버 주소
const origin = "https://nuxt4-jsonserver-board.onrender.com";
// window.location.protocol+"//" + window.location.hostname + ":4100";
// 게시글 단건 조회
export async function fetchPost(query = ''){
  const res = await fetch(`${origin}/posts/?id=${query}`) // GET
  const post = await res.json();
  return post[0]
}

// 조회수 증가
export async function fetchIncrease(query='', viewCount = 0){
  console.log("넘어온 viewCount : ",viewCount);
  viewCount=parseInt(viewCount);
  const res = await fetch(`${origin}/posts/${query}`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({"viewCount":viewCount+1})}).then(response => response.json()).then(data => console.log('PATCH 수정 완료:', data)).catch(e=>console.error(e));
}

// 댓글 조회
export async function fetchComment(query = ''){
  const res = await fetch(`${origin}/comments/?postId=${query}`) // GET
  const comments = await res.json()
  return comments
}

// 게시글 리스트 조회 (공지 + 일반, 검색/페이지네이션 포함)
export async function fetchBoard(page = 1, q = '', sort = 'createdAt',type="all"){
  console.log("넘어온 페이지 : ",page);
  try{
    if(parseInt(page)<1){
      return {
      notices:[],
      boards:[],
      pageCount:0
    }
    }
  }catch(e){
    console.log("여기서 안 잡힘? : ",e);
    return {
      notices:[],
      boards:[],
      pageCount:0
    }
  }
  const activePage = parseInt(page) || 1;
  const limit = 6; // 한 페이지에 보여줄 개수
  const sorts = "-" + (sort || "createdAt");
console.log(origin);
  // json-server(1.0.0-beta.3)는 한글 값 필터(q, _ne, :contains 등)를 전부 무시하고
  // 무조건 전체 목록을 반환하는 버그가 있음. 타입 제외/검색은 서버 대신 JS에서 처리.
  // 공지/일반 둘 다 같은 전체 목록이 필요하므로 요청은 한 번만 보낸다.
  const res = await fetch(`${origin}/posts?_sort=${sorts}&_embed=comments`);
  console.log(res);
  const all = await res.json();
  console.log(all);
  const matches = post => !q || post.title.includes(q) || post.content.includes(q);
  if(type=="all"){

    const notices = all.filter(post => post.type === "공지" && matches(post));
    const boards = all.filter(post => post.type !== "공지" && matches(post));
    
    const pageCount = Math.ceil(boards.length / limit) || 1;
    if(pageCount<activePage){
      return {notices:[],boards:[],pageCount}
    }
  return {
    notices,
    boards: boards.slice((activePage - 1) * limit, activePage * limit),
    pageCount,
  };
}else{
    const notices = all.filter(post => post.type === "공지" && matches(post));
    const pageCount = Math.ceil(notices.length / limit) || 1;
    if(pageCount<activePage){
      return {notices:[],pageCount}
    }
    return {
      notices,
      pageCount
    };
}
}

// 새글 작성
export async function fetchCreate(title = '', nickName = '', content = ''){
  
  let first = nickName.slice(0,1);
  let msg;
  let date = new Date();
  const TIME_ZONE = 9 * 60 * 60 * 1000;

  const res = await fetch(`${origin}/posts`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:title,writer:{nickName:nickName,firstName:first},content:content,
  viewCount:0,type:"일반",createdAt:date,localDate:new Date(date.getTime() + TIME_ZONE).toISOString().replace('T', ' ').slice(0, -5)})}
).then(response => response.json())
.then(data => {if(data.id)msg="success"})
.catch(error => console.error('Error:', error));
return msg;
}

// 게시글 수정
export async function fetchPatch(query = '',title = '', nickName = '', content = ''){
    let first = nickName.slice(0,1);
  let msg;
  let date = new Date();
  const TIME_ZONE = 9 * 60 * 60 * 1000;

      const res = await fetch(`${origin}/posts/${query}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:title,writer:{nickName:nickName,firstName:first},content:content
  })}
).then(response => response.json())
.then(data => {if(data.id)msg="success"})
.catch(error => console.error('Error:', error));
return msg;
}

// 댓글 생성
export async function fetchCreateComment(query='',content=''){
  let nickName="작성자"+Math.ceil(Math.random()*8);
  let first = "작";
    let msg;
    let date = new Date();
    const TIME_ZONE = 9 * 60 * 60 * 1000;
  if(content.trim().length>500){
    return "댓글 내용은 500자 이상 작성이 불가능합니다.";
  }  
  const res = await fetch(`${origin}/comments`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({writer:{nickName:nickName,firstName:first},content:content,postId:query,
  viewCount:0,type:"일반",createdAt:date,localDate:new Date(date.getTime() + TIME_ZONE).toISOString().replace('T', ' ').slice(0, -5)})}
).then(response => response.json())
.then(data => {if(data.id)msg="success"})
.catch(error => console.error('Error:', error));
return msg;
}

// 게시글 삭제
export async function fetchDeletePost(query="", comments = []){
  console.log("삭제 하러 넘어옴");
  console.log(query);
  let msg;
  try{
    comments.map(async (el)=>{
      console.log("댓글 우선 삭제");
    console.log(el);
    const res = await fetch(`${origin}/comments/${el.id}`,{
      method:"DELETE",
      headers:{"Content-Type":"application/json"},
    });
    console.log("댓글 삭제 결과 : ",res);
    console.log("댓글 삭제 결과2 : ",await res.json());
  })
  const res = await fetch(`${origin}/posts/${query}`,{
    method:"DELETE",
    headers:{"Content-Type":"application/json"},
  })
  console.log("게시글 삭제 : ",res);
  console.log("게시글 삭제 : ",await res.json());
  msg="success";
}catch(e){
msg=e;
}
console.log(msg);
return msg;

}