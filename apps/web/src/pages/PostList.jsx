import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { fetchBoard } from "../js/fetch";


export default function PostList(props) {
  const [params,setParams] = useSearchParams({page:1,"sort":"createdAt"});
  const [boards, setBoards] = useState();
  const [notices, setNotices] = useState();
  const [loading, setLoading] = useState(false);
  console.log(params.get("page"));
  console.log("초기 파라미터 : ",params.get("sort"));
  useEffect(()=>{
    const loadData = async () => {
      console.log("주소 확인 : ", window.location.origin);
      console.log("지금 유즈이펙 돌아유");
      console.log(params.get("sort"));
      try{
        let defaultPage = params.get("page")|| 1;
        const q = decodeURIComponent(params.get("q") || "");
        const type = params.get("type") || "all";
        const result = await fetchBoard(defaultPage,q,params.get("sort"),type);
        console.log(result);

        if(result?.notices){
          setNotices(result.notices);
          setBoards(result);
        }else{
          console.log("메시지 넘어옴?");
          console.log(result);
        }
      } catch(err){
        console.log("list 호출 에러 ");
        console.log(err);
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
    let page = parseInt(params.get("page")) || 1;
    let sort = params.get("sort") || "createdAt";
    const type = params.get("type") || "all";
    let q = encodeURIComponent(params.get("q")) || "";
    setParams({page:page-1,sort,q,type});
  }
  function nextPage(){
    let page = parseInt(params.get("page")) || 1;
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    const type = params.get("type") || "all";
    setParams({page:parseInt(page)+1,sort,q,type});
  }
  function handlePage(idx){
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    const type = params.get("type") || "all";
    setParams({page:idx.idx+1,q,sort,type});
  }
  function handleSort(){
    let page = parseInt(params.get("page")) || 1;
    let q = params.get("q") || "";
    const type = params.get("type") || "all";
    setParams({page,q,sort:event.target.value,type});
  }

  function handleTypeAll(){
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    let page = 1;
    let type = "all";
    setParams({page,q,sort,type});
  }
  function handleTypeNotice(){
    let sort = params.get("sort") || "createdAt";
    let q = params.get("q") || "";
    let page = 1;
    let type = "notice";
    setParams({page,q,sort,type});
  }
  console.log(decodeURIComponent(params.get("q")))
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
        {!loading || !boards && !notices && (<div className="post-list-skeleton" aria-busy="true" aria-label="게시글을 불러오고 있어요">
  <div className="skeleton-row">
    <div className="skeleton-copy">
      <span className="skeleton-line skeleton-line--title"></span>
      <span className="skeleton-line skeleton-line--meta"></span>
    </div>
    <span className="skeleton-block"></span>
  </div>
  <div className="skeleton-row">
    <div className="skeleton-copy">
      <span className="skeleton-line skeleton-line--title"></span>
      <span className="skeleton-line skeleton-line--meta"></span>
    </div>
    <span className="skeleton-block"></span>
  </div>
  <div className="skeleton-row">
    <div className="skeleton-copy">
      <span className="skeleton-line skeleton-line--title"></span>
      <span className="skeleton-line skeleton-line--meta"></span>
    </div>
    <span className="skeleton-block"></span>
  </div>
  <div className="skeleton-row">
    <div className="skeleton-copy">
      <span className="skeleton-line skeleton-line--title"></span>
      <span className="skeleton-line skeleton-line--meta"></span>
    </div>
    <span className="skeleton-block"></span>
  </div>
  <div className="skeleton-row">
    <div className="skeleton-copy">
      <span className="skeleton-line skeleton-line--title"></span>
      <span className="skeleton-line skeleton-line--meta"></span>
    </div>
    <span className="skeleton-block"></span>
  </div>
</div>
)}
{loading && notices && (

  <div className="board-toolbar">
          <div className="tabs" role="group" aria-label="게시글 필터">
            <button type="button" className={`tab ${params.get("type")!="notice"?'is-active':''}`} onClick={handleTypeAll} aria-pressed="true">전체</button>
            <button type="button" className={`tab ${params.get("type")=="notice"?'is-active':''}`} onClick={handleTypeNotice} aria-pressed="false">공지</button>
          </div>
          <div className="toolbar-meta">
            <p className="result-count">{loading && boards && notices && notices?.length+boards?.boards?.length || notices?.length || 0}개의 글</p>
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

        )}
          <div className="card card--list">
          <ul className="post-list">
        {loading && notices && notices?.length>0 && notices.map(el=>{

return (
  <li key={`post_notice_${el.id}`} className="post-item is-notice">
              <div className="post-item-body">
                <div className="post-item-head">
                  <span className="pill-notice">공지</span>
            <Link to={`/posts/${el.id}`}>
                  <h2 className="post-item-title"><span>{el.title.length>22 ? el.title.slice(0,22)+"...":el.title}</span></h2>
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
            {loading && boards && boards.boards?.length>0 && boards.boards.map(el=>

            <li key={`board_${el.id}`} className="post-item">
              <div className="post-item-body">
                <div className="post-item-head">
                  <Link to={`/posts/${el.id}`}>
                  <h2 className="post-item-title"><span>{el.title.length>22 ? el.title.slice(0,22)+"...":el.title}</span></h2>
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
 {loading && boards && boards.boards?.length < 1 && notices && notices?.length<1 && (
  <>
  <div className="content-state" role="status">
  <span className="content-state-icon" aria-hidden="true"><i className="pi pi-info-circle"></i></span>
  <h2>표시할 글이 없어요</h2>
  <p>조건을 바꿔서 다시 검색해보세요.</p>
</div>
  </>
 )}
 {loading && notices && params.get("type")!="all" && notices?.length<1 && (
    <>
  <div className="content-state" role="status">
  <span className="content-state-icon" aria-hidden="true"><i className="pi pi-info-circle"></i></span>
  <h2>표시할 글이 없어요</h2>
  <p>조건을 바꿔서 다시 검색해보세요.</p>
</div>
  </>
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
        <span className={loading && boards && boards.pageCount >= parseInt(params.get("page")) && parseInt(params.get("page")) > 1 ? "is-static":"is-disabled"} onClick={prevPage} aria-hidden="true"><i className="pi pi-chevron-left" /></span>
        {loading&& boards && boards.pageCount>1 && Array.from({"length":boards.pageCount},(_,idx)=>{
          if(params==idx){
            console.log("params가 idx랑 같은 시점을 언제 만들었지; : ",params);
            return (<span key={`page${idx+1}`} className="is-static" onClick={()=>handlePage({idx})}>{idx+1}</span>)
          }
          else return (<span key={`page${idx+1}`} className="is-static" onClick={()=>handlePage({idx})}  aria-current={ parseInt(params.get("page")) == idx+1 ?"page":""}>{idx+1}</span>)
        })}
        <span className={boards?.pageCount>parseInt(params.get("page"))?"is-static":"is-disabled"} onClick={nextPage} aria-label="다음 페이지"><i className="pi pi-chevron-right" aria-hidden="true" /></span>
      </div>
    </>
  )
}
