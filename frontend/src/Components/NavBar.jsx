import React from 'react';
// 1. Import NavLink instead of Link
import { NavLink } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
      <NavLink 
        to="/" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Dashboard
      </NavLink> 
      
      <span> | </span>

      <NavLink 
        to="/resources" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Resources
      </NavLink>

      <span> | </span>

      <NavLink 
        to="/snippets" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Snippets
      </NavLink> 
      
      <span> | </span>

      <NavLink 
        to="/tasks" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
       Tasks
      </NavLink> 
      
      <span> | </span>

      <NavLink 
        to="/register" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Register
      </NavLink> 
      
      <span> | </span>

      <NavLink 
        to="/login" 
        style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}
      >
        Login
      </NavLink> 
    </nav>
  );
}

export default NavBar;
