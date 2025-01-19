const jwt = require('jsonwebtoken');
const { UserOrder, Nalco } = require('../models/Order');

const createOrder = async (req, res) => {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Please select products to proceed' });
    }

    try {
        const newOrder = new UserOrder({
            user,
            products,
        });
        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: 'Order created successfully.',
            order: savedOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await UserOrder.find({});
        if (!orders) {
          return res.status(404).json({ message: 'No orders found' });
        }
        res.status(200).json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: 'Error fetching orders' });
      }
};

const updateNalco = async (req, res) => {
    const { nalcoPrice } = req.body;

    if (!nalcoPrice) {
        return res.status(400).json({ message: 'Please enter price' });
    }

    try {
        const nalco = await Nalco.findOne({});
        
        if (!nalco) {
            const newNalco = new Nalco({
                nalcoPrice,
                date: new Date(),
            });

            const savedNalco = await newNalco.save();

            return res.status(201).json({
                message: 'Nalco created successfully.',
                nalco: savedNalco,
            });
        } else {
            nalco.nalcoPrice = nalcoPrice;
            nalco.date = new Date();

            const updatedNalco = await nalco.save();

            return res.status(200).json({
                message: 'Nalco updated successfully.',
                nalco: updatedNalco,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = { createOrder, getOrders, updateNalco };
