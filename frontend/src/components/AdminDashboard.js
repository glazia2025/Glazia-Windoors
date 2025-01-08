import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <Link to="add-product">Add Product</Link> {/* Relative path */}
      </nav>

      {/* Child routes will render here */}
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
