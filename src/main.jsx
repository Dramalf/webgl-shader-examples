import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import Cloud from './cloud';
import { createBrowserRouter, RouterProvider,Navigate } from "react-router-dom";
import './index.css'
const router = createBrowserRouter([
  {
    path: "/cloud",
    element:<Cloud/>
  },
  {
    path: "*",
    element:<Navigate to="/cloud" replace/>
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
  ,
)
