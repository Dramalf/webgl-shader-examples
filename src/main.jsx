import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import Cloud from './cloud';
import { createHashRouter, RouterProvider,Navigate } from "react-router-dom";
import './index.css'
const router = createHashRouter([
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
