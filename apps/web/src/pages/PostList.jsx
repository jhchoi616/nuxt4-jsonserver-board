import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { fetchBoard, fetchNotice } from "../js/fetch";


export default function PostList(props) {
  const [params,setParams] = useSearchParams({page:1,"sort":"createdAt"});
  const [boards, setBoards] = useState();
  const [notices, setNotices] = useState();
  const [loading, setLoading] = useState(false);
  console.log(params.get("page"));
  console.log("초기 파라미터 : ",params.get("sort"));
  useEffect(()=>{
    const loadData = async () => {
      console.log("지금 유즈이펙 돌아유");
      console.log(params.get("sort"));
      try{
        let defaultPage = params.get("page")|| 1;
        const res = await fetchNotice(defaultPage,params.get("q"),params.get("sort"));
        setNotices(res);
        const result = await fetchBoard(defaultPage,params.get("q"),params.get("sort"));
        setBoards(result);
      }finally{
        setLoading(true);
      }
    };
    loadData();
  },[params])
  console.log(boards);
  console.log(notices);
  console.log(loading);
  console.log(boards?.PageCount > params.get("page"));
  console.log( params.get("page") > 1 );
  console.log(params.get("page"));
  function prevPage(){
    let page = params.get("page") || 1;
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    setParams({page:page-1,sort,q});
  }
  function nextPage(){
    let page = params.get("page") || 1;
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    setParams({page:parseInt(page)+1,sort,q});
  }
  function handlePage(idx){
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    setParams({page:idx.idx+1,q,sort});
  }
  function handleSort(){
    let page = params.get("page") || 1;
    let q = params.get("q") || "";
    setParams({page,q,sort:event.target.value});
  }
  return (
    <>
      <section className="page-intro" aria-labelledby="board-title">
        <div>
          <h1 className="page-title" id="board-title">질문과 해결 방법</h1>
          <p className="page-description">
            미션을 진행하며 생긴 질문과 해결한 방법을 나눠보세요.
          </p>
        </div>
      </section>

      <section className="board-panel" aria-label="게시글 목록">
        <div className="board-toolbar">
          <div className="tabs" role="group" aria-label="게시글 필터">
            <button type="button" className="tab is-active" aria-pressed="true">전체</button>
            <button type="button" className="tab" aria-pressed="false">공지</button>
          </div>
          <div className="toolbar-meta">
            <p className="result-count">10개의 글</p>
            <label className="sort-control">
              <span className="sr-only">게시글 정렬</span>
              <select defaultValue="createdAt" onChange={()=>handleSort()}>
                <option value={"createdAt"}>최신순</option>
                <option value={"viewCount"}>조회순</option>
              </select>
              <i className="pi pi-chevron-down" aria-hidden="true" />
            </label>
          </div>
        </div>

          <div className="card card--list">
          <ul className="post-list">
        {loading && notices?.length>0 && notices.map(el=>{

return (
  <li key={`notice_${el.id}`} className="post-item is-notice">
              <div className="post-item-body">
                <div className="post-item-head">
                  <span className="pill-notice">공지</span>
            <Link to={`/posts/${el.id}`}>
                  <h2 className="post-item-title"><span>{el.title}</span></h2>
            </Link>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">{el.writer.nickName}</span>
                  <span className="sep" />
                  <span>{el.localDate}</span>
                  <span className="sep" />
                  <span>조회 {el.viewCount}</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  {el.comments.length}
                </span>
              </div>
            </li>
            ) 
        })}

            {/* <li className="post-item is-notice">
              <div className="post-item-body">
                <div className="post-item-head">
                  <span className="pill-notice">공지</span>
                  <h2 className="post-item-title"><span>이번 주 코드 리뷰 일정 안내</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">운영자</span>
                  <span className="sep" />
                  <span>8월 11일</span>
                  <span className="sep" />
                  <span>조회 324</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  3
                </span>
              </div>
            </li> */}
            {loading && boards.boards?.length>0 && boards.boards.map(el=>

            <li key={`board_${el.id}`} className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <Link to={`/posts/${el.id}`}>
                  <h2 className="post-item-title"><span>{el.title}</span></h2>
                  </Link>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">{el.writer.nickName}</span>
                  <span className="sep" />
                  <span>{el.localDate}</span>
                  <span className="sep" />
                  <span>조회 {el.viewCount}</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  {el.comments.length}
                </span>
              </div>
            </li>
            )}

            {/* <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>페이지네이션 쿼리는 어떻게 넘기시나요?</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자5</span>
                  <span className="sep" />
                  <span>8월 9일</span>
                  <span className="sep" />
                  <span>조회 270</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  5
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>테이블에 정렬 붙이는 방법 정리했습니다</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자4</span>
                  <span className="sep" />
                  <span>8월 8일</span>
                  <span className="sep" />
                  <span>조회 243</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  0
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>상세 화면에서 새로고침하면 내용이 사라져요</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자3</span>
                  <span className="sep" />
                  <span>8월 7일</span>
                  <span className="sep" />
                  <span>조회 216</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  1
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>작성 폼 유효성 검사 어디까지 하셨어요?</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자2</span>
                  <span className="sep" />
                  <span>8월 6일</span>
                  <span className="sep" />
                  <span>조회 189</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  2
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>json-server 응답 구조 정리해봤습니다</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자1</span>
                  <span className="sep" />
                  <span>8월 5일</span>
                  <span className="sep" />
                  <span>조회 162</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  4
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>모바일에서 목록이 잘리는 현상 해결했습니다</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자5</span>
                  <span className="sep" />
                  <span>8월 4일</span>
                  <span className="sep" />
                  <span>조회 135</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  0
                </span>
              </div>
            </li>

            <li className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <h2 className="post-item-title"><span>처음 세팅할 때 참고한 문서 모음</span></h2>
                </div>
                <div className="post-item-meta">
                  <span className="post-author">작성자4</span>
                  <span className="sep" />
                  <span>8월 3일</span>
                  <span className="sep" />
                  <span>조회 108</span>
                </div>
              </div>
              <div className="post-item-side">
                <span className="reply-count has-replies">
                  <i className="pi pi-comment" aria-hidden="true" />
                  <span className="sr-only">댓글 </span>
                  1
                </span>
              </div>
            </li> */}
          </ul>
        </div>
      </section>

      <div className="pager" aria-label="페이지 이동 UI">
        <span className={loading && boards.pageCount >= params.get("page") && params.get("page") > 1 ? "is-static":"is-disabled"} onClick={prevPage} aria-hidden="true"><i className="pi pi-chevron-left" /></span>
        {loading && boards.pageCount>1 && Array.from({"length":boards.pageCount},(_,idx)=>{
          if(params==idx)
          return (<span key={`page${idx+1}`} className="is-static" onClick={()=>handlePage({idx})} aria-current="page">{idx+1}</span>)
          else return (<span key={`page${idx+1}`} className="is-static" onClick={()=>handlePage({idx})} >{idx+1}</span>)
        })}
        <span className={boards?.pageCount>params.get("page")?"is-static":"is-disabled"} onClick={nextPage} aria-label="다음 페이지"><i className="pi pi-chevron-right" aria-hidden="true" /></span>
      </div>
    </>
  )
}
