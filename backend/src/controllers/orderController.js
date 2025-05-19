const jwt = require("jsonwebtoken");
const { UserOrder, Nalco } = require("../models/Order");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { extractQueryParams, escapeRegExp } = require("../utils/common");

const createOrder = async (req, res) => {
  const { user, products, payment, totalAmount } = req.body;
  if (
    !user ||
    !products ||
    !Array.isArray(products) ||
    products.length === 0 ||
    !payment ||
    !payment.amount ||
    !payment.proof ||
    !totalAmount
  ) {
    return res
      .status(400)
      .json({ message: "Please select products to proceed" });
  }

  try {
    const newOrder = new UserOrder({
      user,
      products,
      payments: [
        {
          amount: payment.amount,
          proof: payment.proof,
          cycle: 1,
          isApproved: false,
        },
      ],
      totalAmount,
    });
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order created successfully.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getOrders = async (req, res) => {
  try {
    let queryParams = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("req.query", JSON.stringify(queryParams, null, 2));
    console.log("req.user", JSON.stringify(user, null, 2));
    let { page, limit, filters, sortObj } = extractQueryParams(req.query);

    let query = {
      totalAmount: { $exists: true },
    };
    let skip = (page - 1) * limit;

    if (user && user.role !== "admin") {
      query["user.userId"] = user.userId;
    }

    if (filters.orderType && filters.orderType === "ongoing") {
      query["payments.isApproved"] = false;
    }

    if (filters.orderType && filters.orderType === "completed") {
      query["isComplete"] = true;
    }

    if (filters.search) {
      query["$or"] = [
        {
          "products.name": {
            $regex: escapeRegExp(filters.search),
            $options: "i",
          },
        },
        {
          "products.description": {
            $regex: escapeRegExp(filters.search),
            $options: "i",
          },
        },
      ];
    }

    if (filters.orderId) {
      query["_id"] = filters.orderId;
    }

    console.log("query", JSON.stringify(query, null, 2));
    console.log("page", page);
    console.log("skip", skip);
    console.log("limit", limit);
    console.log("filters", JSON.stringify(filters, null, 2));
    console.log("sortObj", JSON.stringify(sortObj, null, 2));

    const orders = await UserOrder.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const createPayment = async (req, res) => {
  const { orderId, amount, proof } = req.body;

  if (!orderId || !amount || !proof) {
    return res
      .status(400)
      .json({ message: "Please select order and add payment details." });
  }

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
    });

    if (!order) {
      return res.status(400).json({
        message: "Order cannot be found.",
      });
    }

    const latestPayment = order.payments[order.payments.length - 1];

    order.payments.push({
      amount,
      proof,
      cycle: latestPayment.cycle + 1,
      isApproved: false,
    });
    order.updatedAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Payment approved successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const approvePayment = async (req, res) => {
  const { orderId, paymentId, finalPaymentDueDate, driverInfo, eWayBill, taxInvoice } = req.body;

  if (!orderId || !paymentId) {
    return res
      .status(400)
      .json({ message: "Please select order and payment." });
  }

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
      "payments._id": paymentId,
    });

    if (!order) {
      return res.status(400).json({
        message: "Order cannot be found.",
      });
    }

    const payment = order.payments.find((el) => el._id.toString() === paymentId.toString());

    if (!payment) {
      return res.status(400).json({
        message: "Payment cannot be found.",
      });
    }

    if (payment.cycle === 1 && !finalPaymentDueDate) {
      return res.status(400).json({
        message: "Final payment due date is required.",
      });
    }

    if (payment.cycle === 2 && (!driverInfo || !eWayBill || !taxInvoice)) {
      return res.status(400).json({
        message: "Driver information, EWay Bill, and Tax Invoice are required.",
      });
    }

    order.payments = order.payments.map((el) =>
      el._id.toString() === paymentId.toString()
        ? { ...el, isApproved: true }
        : el
    );

    if (order.payments.length === 1) {
      order.payments.push({
        amount: order.payments[0].amount,
        cycle: 2,
        isApproved: false,
        dueDate: finalPaymentDueDate,
      });
    }

    if (payment.cycle === 2) {
      order.driverInfo = driverInfo;
      order.eWayBill = eWayBill;
      order.taxInvoice = taxInvoice;
      order.isComplete = true;
      order.completedAt = new Date();
    }

    order.updatedAt = new Date();

    const updatedOrder = await order.save();

    if(updatedOrder.isComplete) {
      return res.status(200).json({
        message: "Order completed successfully.",
        order: updatedOrder,
      });
    }

    return res.status(200).json({
      message: "Payment approved successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const completeOrder = async (req, res) => {
  const { orderId, eWayBill, driverInfo, taxInvoice } = req.body;

  if (!orderId || !eWayBill || !driverInfo || !taxInvoice) {
    return res
      .status(400)
      .json({ message: "Please select order and payment." });
  }

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
    });

    if (!order) {
      return res.status(400).json({
        message: "Order cannot be found.",
      });
    }

    order.eWayBill = eWayBill;
    order.driverInfo = {
      name: driverInfo.name,
      phone: driverInfo.phone,
      description: driverInfo.description,
    };
    order.taxInvoice = taxInvoice;
    order.isComplete = true;
    order.updatedAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order completed successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updateNalco = async (req, res) => {
  const { nalcoPrice } = req.body;

  if (!nalcoPrice) {
    return res.status(400).json({ message: "Please enter price" });
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
        message: "Nalco created successfully.",
        nalco: savedNalco,
      });
    } else {
      nalco.nalcoPrice = nalcoPrice;
      nalco.date = new Date();

      const updatedNalco = await nalco.save();

      return res.status(200).json({
        message: "Nalco updated successfully.",
        nalco: updatedNalco,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "glazia.in@gmail.com",
    pass: "Glazia@2025!@",
    // pass: 'qmatmebtwyepcmky',
  },
});

const sendEmail = async (req, res) => {
  const { to, subject, text, pdf } = req.body;
  console.log("received");
  const pdfBuffer = Buffer.from(pdf, "base64");

  const mailOptions = {
    from: "glazia.in@gmail.com",
    to,
    subject,
    text,
    attachments: [
      {
        filename: "Glazia Performa Invoice.pdf",
        content: pdfBuffer,
        encoding: "base64",
      },
    ],
  };
  res.send("Email sent successfully");
  transporter.sendMail(mailOptions, (error, info) => {
    console.log(error);
    if (error) {
      return res.status(500).send("Error sending email");
    }
  });
};

const uploadPaymentProof = async (req, res) => {
  const { orderId, paymentId, proof } = req.body;

  if (!orderId || !paymentId || !proof) {
    return res.status(400).json({ message: "Please select order and payment." });
  }

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
    });

    if (!order) {
      return res.status(400).json({
        message: "Order cannot be found.",
      });
    }

    const payment = order.payments.find((el) => el._id.toString() === paymentId.toString());

    if (!payment) {
      return res.status(400).json({
        message: "Payment cannot be found.",
      });
    }

    payment.proof = proof;
    payment.isApproved = false;
    payment.proofAddedAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Payment proof uploaded successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  createPayment,
  approvePayment,
  completeOrder,
  updateNalco,
  sendEmail,
  uploadPaymentProof,
};
