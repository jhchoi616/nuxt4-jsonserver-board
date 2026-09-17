const jsonServer = require('json-server')
const cors = require('cors');
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults({ noCors: true })

server.use(middlewares)
server.use(cors({
  origin: ["https://nuxt4-jsonserver-board-web.vercel.app/","https://nuxt4-jsonserver-board-web-git-react-jhchoi-1999.vercel.app/","https://nuxt4-jsonserver-board-ixhkoj7t1-jhchoi-1999.vercel.app/","http://192.168.1.139:3500/"], // 👈 허용할 클라이언트(Vite 등) 주소를 적어주세요
  credentials: true                // 인증 정보(쿠키 등) 허용이 필요하다면 true
}));
server.listen(4100, () => {
  console.log('4100')
})