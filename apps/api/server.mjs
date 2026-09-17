import jsonServer from "json-server";
import cors from "cors";
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();


server.use(cors({
  origin: ["https://nuxt4-jsonserver-board-web.vercel.app/","https://nuxt4-jsonserver-board-web-git-react-jhchoi-1999.vercel.app/","https://nuxt4-jsonserver-board-ixhkoj7t1-jhchoi-1999.vercel.app/","http://192.168.1.139:3500/"], // 👈 허용할 클라이언트(Vite 등) 주소를 적어주세요
  credentials: true
}));
server.use(middlewares);
server.use(router);

const port = process.env.PORT || 4100;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});