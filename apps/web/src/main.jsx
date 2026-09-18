import { PrimeReactProvider } from 'primereact/api'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, createBrowserRouter, RouterProvider, useRouteError} from 'react-router-dom'

import App from './App.jsx'

import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css'
import './styles.css'

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />
    
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
