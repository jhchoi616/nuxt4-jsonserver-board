import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchComment, fetchPost } from '../js/fetch'
export default function PostDetail(props) {
  let {id} = useParams();
  const [post, setPost] = useState("");
  const [comments , setComment] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
   
    setLoading(false);
   const loadData = async ()=>{
    try{
      const board = await fetchPost(id);
      setPost(board);
      console.log(board);
      const comments = await fetchComment(id);
      setComment(comments);
    }finally{
      setLoading(true);
    }
    };
  loadData();  
  },[]);
  return (
    <>
    <Link to={"/"}>
      <span className="back-link is-static">
        <i className="pi pi-chevron-left" aria-hidden="true" />
        전체 글로
      </span>
    </Link>
      {loading && post && (

        <article className="card article-card">
        <h1 className="page-title article-title">{post.title}</h1>

        <div className="post-head">
          <div className="author">
            <span className="author-face" aria-hidden="true">{post.writer?.firstName}</span>
            <div>
              <div className="author-name">{post.writer?.nickName}</div>
              <div className="author-date">{post.createdAt}</div>
            </div>
          </div>
          <div className="stat-row">
            <span aria-label="조회 297회">
              <i className="pi pi-eye" aria-hidden="true" />
              {post.viewCount}
            </span>
            <span aria-label="댓글 2개">
              <i className="pi pi-comment" aria-hidden="true" />
              {comments?.length}
            </span>
          </div>
        </div>

        <hr className="rule" />

        <div className="post-body">
          {post.content}
        </div>

        <div className="post-actions">
          <Button type="button" label="글 삭제" severity="danger" icon="pi pi-trash" className="is-static" />
          <span className="p-button p-button-secondary is-static">
            <i className="pi pi-pencil" aria-hidden="true" />
            <span>글 수정</span>
          </span>
        </div>
      </article>
      )}

      <section className="card comments-card">
        <div className="section-heading">
          <div>
            <h2 className="section-title">댓글 {comments?.length}개</h2>
            <p>답변이나 참고 자료를 나누면 더 빨리 해결할 수 있어요.</p>
          </div>
        </div>

          <ul className="comment-list">
        
        {loading && comments && comments.map(el=>{
          return <li className="comment">
            <span className="comment-face" aria-hidden="true">{el.writer.firstName}</span>
            <div>
              <div className="author-name">
                {el.writer.nickName}
                <span className="author-date comment-when">{el.createdAt}</span>
              </div>
              <p className="comment-text">{el.content}</p>
            </div>
          </li>
        })}
         
        </ul>

        <form className="comment-form field">
          <label className="field-label" htmlFor="comment">댓글 작성</label>
          <InputTextarea
            id="comment"
            rows={3}
            placeholder="해결 방법이나 참고 자료를 알려주세요"
            />
          <div className="row-end">
            <Button type="button" label="댓글 등록" disabled />
          </div>
        </form>
      </section>

      {/* 퍼블리싱된 삭제 확인 UI. visible 상태와 이벤트는 인턴이 구현한다. */}
      <Dialog
      visible={false}
        header="이 글을 삭제할까요?"
        draggable={false}
        footer={(
          <>
            <Button type="button" label="취소" severity="help" />
            <Button type="button" label="삭제" severity="danger" />
          </>
        )}
        >
        댓글 {comments?.length}개도 함께 사라지고, 되돌릴 수 없어요.
      </Dialog>
    </>
  )
}
