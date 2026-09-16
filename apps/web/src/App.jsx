import { useEffect } from 'react'
import AppHeader from './components/AppHeader.jsx'
import PostDetail from './pages/PostDetail.jsx'
import PostForm from './pages/PostForm.jsx'
import PostList from './pages/PostList.jsx'
import { Route, Routes, Link, useSearchParams } from 'react-router-dom'
import NotFound from './pages/NotFound.jsx'


export default function App() {
  // 쿼리스트링 변경될 경우 << header에서 변경하니까 props로 넘기고  redis로 전역 관리..는 과하고
  // 여기서 변경 감지해서 useEffect로 처리하고 list 넘겨주기?
  // const [searchParams,setSearchParams] = useSearchParams();

  // useEffect(()=>{
  //   console.log("???? 그러고보니 왜 얘 안 썼지 ? : ",searchParams);
  // },[searchParams])

  return (
    <>
      <AppHeader />
      <main id="main" tabIndex="-1" className="shell page">
      <Routes>
        <Route path='/' element={<PostList/>}  />
        <Route path='/posts/:id' element={<PostDetail/>} />
        <Route path='/posts/:id/edit' element={<PostForm/>} />
        <Route path='/write' element={<PostForm/>} />
        <Route path='*' element={<NotFound /> } />
      </Routes>
        
      </main>
    </>
  )
}
