// 게시글 단건 조회
export async function fetchPost(query = ''){
  const res = await fetch(`http://localhost:4100/posts/?id=${query}`) // GET
  const post = await res.json();
  return post[0]
}

// 조회수 증가
export async function fetchIncrease(query='', viewCount = 0){
  console.log("넘어온 viewCount : ",viewCount);
  const res = await fetch(`http://localhost:4100/posts/${query}`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({"viewCount":viewCount+1})}).then(response => response.json()).then(data => console.log('PATCH 수정 완료:', data)).catch(e=>console.error(e));
}

// 댓글 조회
export async function fetchComment(query = ''){
  const res = await fetch(`http://localhost:4100/comments/?postId=${query}`) // GET
  const comments = await res.json()
  return comments
}

// 공지 리스트 조회
export async function fetchNotice(q = '', sort = ''){
    const res = await fetch(`http://localhost:4100/posts/?_embed=comments&q=${q}&_sort=createdAt&_order=${sort}&type=공지`)
    const list = await res.json();
    return list;
}

// 게시글 리스트 조회
export async function fetchBoard(page = 1, q = '', sort = 'createdAt'){
  console.log("넘어온 페이지 : ",page);
  const activePage = page || 1;
  console.log("넘어온 active페이지 : ",activePage);
  console.log("적용할 sort : ",sort);
  const limit = 6; // 한 페이지에 보여줄 개수
  sort = sort || "createdAt";
  let sorts = "-"+sort;
  let url;
  console.log("지금 검색값 넘어옴? : ",q);
  // 파라미터 우선순위가 내정되어있는 듯 함 섞어섞어 돌림판!
// TODO 검색어 필터가 적용이 안됨

// AI 사용 하자 q 검색 필터로 검색이 안됨
// like도 안됨
// eq 만 가능함
  url =  `http://localhost:4100/posts?q=${q}&type_ne=공지&_sort=${sorts}&_page=${activePage}&_per_page=${limit}&_embed=comments`;
  // if (q) url += `&q=${q}`;
  console.log("지금 보낸 쿼리문",url);
  const res = await fetch(url);
  const result = await res.json();
  console.log("조회 결과 : ",result);
  
  if(!result.data){
    // 구 버전 문법: _per_page 대신 _limit을 사용합니다. 문제는 여기도 안 먹고 신버전도 웹에서 직접 사용하면 되지만 버전이 안 맞음
    // 아니 _page를 앞으로 당기니까 신버전으로 적용 또 다시 돌아감.. 일단 같이 두기!
    // 구버전에서 page가 무시당함
    url = `http://localhost:4100/posts?_page=${activePage}&_limit=${limit}&_embed=comments&type_ne=공지`;
    
  // 구 버전 검색 및 정렬 문법 적용
  if (q) url += `&q=${q}`;
  if (sort) url += `&sort=${sort}&_order=desc`;
  
  try {
    const res = await fetch(url);
    console.log("동작한 url : ",url)
    // 헤더에서 전체 개수 가져오기 (대소문자 둘 다 체크)
    const totalCountHeader = res.headers.get('X-Total-Count') || res.headers.get('x-total-count');
    
    let pageCount = 0;
    
    if (totalCountHeader !== null) {
      const totalCount = parseInt(totalCountHeader, 10);
      pageCount = Math.ceil(totalCount / limit);
    } else {
      
      // 전체 데이터를 한 번 더 불러와 개수를 수동체크
      const totalRes = await fetch(`http://localhost:4100/posts?type_ne=공지${q ? `&q=${q}` : ''}`);
      const totalData = await totalRes.json();
      pageCount = Math.ceil(totalData.length / limit);
    }
    
    const boards = await res.json(); // 
    console.log("다시 돌려보낼 list내용들 : ", boards);
    return {
      boards: boards,     // 게시글 배열 (최대 5개)
      pageCount: pageCount // 총 페이지 수
    };
    
  } catch (error) {
    console.error("데이터 패치 실패:", error);
    return { boards: [], pageCount: 0 };
  }
}
console.log("구버전이면 여기 안옴 : ");
  return {boards:result.data,pageCount:result.pages}

}

// 새글 작성
export async function fetchCreate(title = '', nickName = '', content = ''){
  
  let first = nickName.slice(0,1);
  let msg;
  let date = new Date();
  const TIME_ZONE = 9 * 60 * 60 * 1000;

  const res = await fetch(`http://localhost:4100/posts`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:title,writer:{nickName:nickName,firstName:first},content:content,
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

      const res = await fetch(`http://localhost:4100/posts/${query}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:title,writer:{nickName:nickName,firstName:first},content:content
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
  const res = await fetch(`http://localhost:4100/comments`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({writer:{nickName:nickName,firstName:first},content:content,postId:query,
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
    const res = await fetch(`http://localhost:4100/comments/${el.id}`,{
      method:"DELETE",
      headers:{"Content-Type":"application/json"},
    });
    console.log("댓글 삭제 결과 : ",res);
    console.log("댓글 삭제 결과2 : ",await res.json());
  })
  const res = await fetch(`http://localhost:4100/posts/${query}`,{
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