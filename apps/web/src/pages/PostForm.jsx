import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchBoard, fetchCreate, fetchPatch, fetchPost } from '../js/fetch'
import { useEffect, useRef, useState } from 'react'

export default function PostForm(props) {
  const {id} = useParams();
  const title = useRef(null);
  const nickName = useRef(null);
  const content = useRef(null);
  const [formTitle, setFormTitle]=useState("");
  const [formNickName, setFormNickName]=useState("");
  const [formContent, setFormContent]=useState("");
  const [loading, setLoading] = useState(false);
  const [dialog,setDialog] = useState(false);
  const [when, setWhen] = useState(true);
  const navigate = useNavigate();
  const [parameters,setParameters] = useSearchParams();
 const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
     return when && currentLocation.pathname !== nextLocation.pathname
    }
  );


  function handleTitle(e){
    if(e.target.value.length<=100){
      if(loading)
        setLoading(false);
      setFormTitle(e.target.value);
    }
  }
  function handleNickName(e){
    if(e.target.value.length<=20){
      if(loading)
        setLoading(false);
      setFormNickName(e.target.value);
    }
  }
  function handleContent(e){
    if(e.target.value.length<=2000){
      if(loading)
        setLoading(false);
      setFormContent(e.target.value);
    }
  }

  useEffect(()=>{
    
    if(id){
      const loadData = async () => {
        const res = await fetchPost(id);
        console.log("수정 하러 옴 : ",res);
        if(res.title)setFormTitle(res.title);
        if(res.content)setFormContent(res.content);
        if(res.writer.nickName)setFormNickName(res.writer.nickName);
      };
      loadData();
    }else{
      let data = localStorage.getItem("board");
      
      if(data){
        console.log("??");
        data = JSON.parse(data);
        setFormTitle(data.formTitle);
        setFormContent(data.formContent);
        setFormNickName(data.formNickName);
      }
    }
  },[]);


  useEffect(() => {
    console.log(blocker)
    console.log(blocker.state);
    console.log(dialog);
    if (blocker.state == "blocked") {
      console.log("?")
      setDialog(true);
      return;
    }
    // if (window.confirm("정말로 이동하시겠습니까?")) {
    //   blocker.proceed();
    // } else {
    //   blocker.reset();
    // }
  }, [blocker.state]);

function handlePage(){
  console.log("아이디 확인 : ",id);
  setDialog(false);
  if(!id)
    localStorage.setItem("board",JSON.stringify({formTitle,formNickName,formContent}));
  if(blocker.state === "blocked"){

    setWhen(false);
    setTimeout(() => {
      const move = blocker.location.pathname + `?page=${parameters.get("page")||1}&sort=${parameters.get("sort")||"createdAt"}&q=${parameters.get("q")||""}`;
      console.log("이동하려는 내용 : ",move);
      console.log(parameters.get("q"));
      console.log(parameters.get("sort"));
      console.log(parameters.get("page"));
      navigate(move);
      
    }, 1);
    
    
    // 3. blocker 상태 초기화
    blocker.reset();
  }
}

    const submit = async () => {
      setLoading(true);
      if(title.current.value.trim()?.length<1){
      title.current.value = title.current.value.trim();
      alert("제목을 입력해주세요");
      title.current.focus();
      return;
    }
    if(nickName.current.value.trim()?.length<1){
      nickName.current.value=nickName.current.value.trim();
      alert("닉네임을 작성해주세요");
      nickName.current.focus();
      return;
    }
    console.log("본문 엔터값 ? : ",content.current.value);
    if(content.current.value.trim()?.length<1){
      content.current.value = content.current.value.trim();
      alert("본문 내용을 작성해주세요");
      content.current.focus();
      return;
    }
    if(id){
      let msg = await fetchPatch(id,formTitle,formNickName,formContent);
      if(msg=="success"){
        alert("수정에 성공하였습니다.");
        setFormTitle("");
        setFormNickName("");
        setFormContent("");
        location.href=`/posts/${id}`;
      }
    }else{
      let msg = await fetchCreate(formTitle,formNickName,formContent)
      if(msg=="success"){
        alert("등록에 성공하였습니다.");
        localStorage.clear();
        setFormTitle("");
        setFormNickName("");
        setFormContent("");
        location.href="/";
      }
    }
    setLoading(false);
  }
  return (
    <>
    <Link to={"/"}>
      <span className="back-link is-static">
        <i className="pi pi-chevron-left" aria-hidden="true" />
        전체 글로
      </span>
    </Link>

      <section className="page-intro page-intro--compact">
        <div>
          <h1 className="page-title">새 글 작성</h1>
          <p className="page-description">질문이나 해결 방법을 작성하면 목록에 바로 보여요.</p>
        </div>
      </section>

      <div className="write-layout">
        <form className="card form-card">
          <div className="field">
            <label className="field-label" htmlFor="title">
              제목
              <span className="req" aria-hidden="true">*</span>
            </label>
            <InputText
              id="title"
              placeholder="예: 페이지네이션 쿼리는 어떻게 넘기시나요?"
              ref={title}
              value={formTitle}
              onChange={handleTitle}
              aria-describedby="title-count"
            />
            <div className="field-foot">
              <span className="field-hint" id="title-count">{formTitle?.trim().length} / 100자</span>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="author">
              닉네임
              <span className="req" aria-hidden="true">*</span>
            </label>
            <InputText
              id="author"
              placeholder="목록에 표시될 이름"
              ref={nickName}
              value={formNickName}
              onChange={handleNickName}
              aria-describedby="author-count"
            />
            <div className="field-foot">
              <span className="field-hint" id="author-count">{formNickName?.trim().length} / 20자</span>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="content">
              내용
              <span className="req" aria-hidden="true">*</span>
            </label>
            <InputTextarea
              id="content"
              rows={12}
              placeholder="막힌 부분, 시도해본 방법, 궁금한 점을 차례로 적어보세요"
              ref={content}
              value={formContent}
              onChange={handleContent}
              aria-describedby="content-count"
            />
            <div className="field-foot">
              <span className="field-hint" id="content-count">{formContent?.trim().length} / 2,000자</span>
            </div>
              <span className="field-hint" id="content-err" hidden>입력하신 내용이 {formContent?.trim().length}자로 2000자를 넘거나 0자입니다.</span>
          </div>

          <div className="form-footer">
            <Link to={"/"}>
            <span className="p-button p-button-help btn-xl is-static">작성 취소</span>
            </Link>
            <Button type="button" label="글 등록" className="btn-xl" icon="pi pi-check" onClick={submit} disabled={loading?"disabled":""} />
          </div>
        </form>

        <aside className="writing-guide" aria-labelledby="writing-guide-title">
          <span className="guide-icon" aria-hidden="true"><i className="pi pi-lightbulb" /></span>
          <h2 id="writing-guide-title">답변받기 좋은 글</h2>
          <ul>
            <li>문제가 생긴 상황을 먼저 알려주세요.</li>
            <li>이미 시도한 방법을 함께 적어주세요.</li>
            <li>개인정보는 글에 남기지 마세요.</li>
          </ul>
        </aside>
      </div>

      {/* 퍼블리싱된 이탈 확인 UI. visible 상태와 이벤트는 인턴이 구현한다. */}
      <Dialog
        visible={dialog}
        header="작성을 그만둘까요?"
        draggable={false}
        onHide={()=>{
          setDialog(false);
          if(blocker.state === "blocked"){
            blocker.reset();
          }
        }}
        footer={(
          <>
            <Button type="button" label="계속 작성" 
            onClick={()=>{
              setDialog(false);
              if (blocker.state === "blocked") {
                blocker.reset();
              }}}
               severity="help" />
               {id && (
                 <Button type="button" label="내용 버리고 나가기" onClick={handlePage} severity="danger" />
               )}
               {!id && (
                 <Button type="button" label="임시저장하고 나가기" onClick={handlePage} severity="danger" />
               )}
          </>
        )}
      >
        지금 나가면 입력한 내용이 사라져요.
      </Dialog>
    </>
  )
}
