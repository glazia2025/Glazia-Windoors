import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
        const token = localStorage.getItem('userToken'); 
        try {
            const response = await axios.get('http://localhost:5000/api/admin/getProducts',         {
                headers: {
                  Authorization: `Bearer ${token}`, // Include token for authentication
                },
              }); // Backend route
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ₹{product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProducts;
