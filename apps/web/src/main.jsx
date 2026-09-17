import { PrimeReactProvider } from 'primereact/api'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, createBrowserRouter, RouterProvider, useRouteError} from 'react-router-dom'

import App from './App.jsx'

import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css'
import './styles.css'
function NotFound() {
  const error = useRouteError();
  console.log("에러 발생");
  console.error(error);

  return (
    <div>
      <h1>404 Not Found</h1>
      <p>존재하지 않는 페이지입니다.</p>
    </div>
  );
}
const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    errorElement: <NotFound />
  },
]);

createRoot(document.getElementById("app")).render(
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
);
// createRoot(document.getElementById('app')).render(
//   // <StrictMode>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//   // </StrictMode>,
// )
