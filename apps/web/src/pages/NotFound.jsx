import { Link, useRouteError } from "react-router-dom";

export default function NotFound(){
    const error = useRouteError();
  console.log(error);
return (
    <>
    <div className="content-state content-state--danger" role="alert">
  <span className="content-state-icon" aria-hidden="true"><i className="pi pi-exclamation-triangle"></i></span>
  <h2>존재하지 않는 페이지입니다.</h2>
  <p>올바른 경로로 이동해주세요</p>
  <Link to={"/"}>
  <span className="p-button p-button-secondary is-static"><span>메인 페이지</span></span>
  </Link>
</div>
    </>
)
}