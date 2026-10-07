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
    </nav>
  );
}

export default NavBar;
