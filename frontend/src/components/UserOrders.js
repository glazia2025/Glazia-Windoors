import React from 'react';
import UserProducts from './UserProducts';
import { Route } from 'react-router-dom';

const UserOrders = () => {
  return (
    <div>
      <h2>User Orders</h2>
      <p>View and manage your orders here!</p>
      {/* Add user-specific functionality like placing orders */}
      <UserProducts/>
      {/* <Route path="/user/products" element={<UserProducts />} /> */}
    </div>
  );
};

export default UserOrders;
