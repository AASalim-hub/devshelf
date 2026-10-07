import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import NavBar from './Routes/AppLayout/NavBar.jsx'
import DashboardPage from './Router/AppLayout/DashboardPage.jsx';
import ResourcesPage from './Router/AppLayout/resources/ResourcesPage.jsx';
import SnippetPage from './Router/AppLayout/snippets/SnippetPage.jsx';
import TaskPage from './Router/AppLayout/tasks/TaskPage.jsx';
import RegisterPage from './Router/register/RegisterPage.jsx';
import LoginPage from './Router/login/LoginPage.jsx';



function App() {

  return (
      <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path='/' element={<DashboardPage />}/>        
          <Route path='/resources' element={<ResourcesPage />}/>
          <Route path='/snippet' element={<SnippetPage />}/>
          <Route path='/task' element={<TaskPage />}/>
          <Route path='/register' element={<RegisterPage />}/>
          <Route path='/login' element={<LoginPage />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
