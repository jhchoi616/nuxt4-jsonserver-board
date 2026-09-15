import { InputText } from 'primereact/inputtext'
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export default function AppHeader(props) {
  const [params,setParams] = useSearchParams();
  const [search,setSearch]=useState("");
  const navigator = useNavigate();
  const location = useLocation();
console.log("넘겨받은 프로퍼티들 : ",props);
// async function fetchSeqrch(){
//   await fetchBoard();
// }
  function handleSearch(e){
    setSearch(event.target.value);
    let page = params.get("page") || 1;
    let sort = params.get("sort") || "createdAt";
    setParams({page,sort,q:encodeURIComponent(event.target.value)});
console.log("??얘 뭔값임",location);
    if(location.pathname !="/"){
      navigator(`/${location.search}`);
    }
    // console.log(decodeURIComponent(params.get("q"))); 여기서 한글자씩 밀림
    // 댓글 empty 처리
    // 검색 값 올때마다? 여기서 디바운스 호출 ㅇㅋ
    
  }
  function debounce(func, delay) {
    let timer;
    return function() {
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to={'/'}>
        <div className="logo">
          <span className="logo-mark" aria-hidden="true">M</span>
          <span className="logo-copy"><strong>개발 미션 게시판</strong></span>
        </div>
        </Link>

        <div className="header-actions">
          <div className="search">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              type="search"
              placeholder="질문이나 해결 방법 검색"
              aria-label="게시글 검색"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <Link to={"/write"}>
          <span className="p-button header-write is-static">
            <i className="pi pi-plus" aria-hidden="true" />
            <span>글쓰기</span>
          </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
