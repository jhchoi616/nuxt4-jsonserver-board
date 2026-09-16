import { InputText } from 'primereact/inputtext'
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export default function AppHeader(props) {
  const [params,setParams] = useSearchParams();
  const [search,setSearch]=useState("");
  const navigator = useNavigate();
  const location = useLocation();
  const searchTimer = useRef(null);

  function handleSearch(e){
    const value = e.target.value;
    setSearch(value); // 입력창은 즉시 반영, 조회만 디바운스
    
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      let page = params.get("page") || 1;
      let sort = params.get("sort") || "createdAt";
      let type = params.get("type") || "all";
      setParams({page,sort,q:encodeURIComponent(value),type});
      if(location.pathname !="/"){
        navigator(`/${location.search}`);
      }
    }, 300);
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
