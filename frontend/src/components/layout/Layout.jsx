import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
