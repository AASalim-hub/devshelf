import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import NavBar from './Components/NavBar.jsx'
import DashboardPage from './Pages/DashboardPage.jsx';
import ResourcesPage from './Pages/ResourcesPage.jsx';
import SnippetPages from './Pages/SnippetsPages.jsx';
import TasksPages from './Pages/TasksPages.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';



function App() {

  return (
      <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path='/' element={<DashboardPage />}/>        
          <Route path='resources' element={<ResourcesPage />}/>
          <Route path='snippets' element={<SnippetPages />}/>
          <Route path='tasks' element={<TasksPages />}/>
          <Route path='register' element={<RegisterPage />}/>
          <Route path='login' element={<LoginPage />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
