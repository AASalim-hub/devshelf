import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import NavBar from './Components/NavBar.jsx'
import DashboardPage from './Pages/DashboardPage.jsx';
import ResourcesPage from './Pages/ResourcesPage.jsx';



function App() {

  return (
      <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path='/' element={<DashboardPage />}/>
          <Route path='resources' element={<ResourcesPage />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
