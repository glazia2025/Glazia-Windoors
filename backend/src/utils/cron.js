const cron = require("node-cron");
const fs = require("fs");
const { Nalco } = require("../models/Order");
const { downloadPdf } = require("./nalcoPriceFetch");


const updateNalcoPrice = async (nalcoPrice) => {

  try {
    const nalco = await Nalco.findOne({});

    if (!nalco) {
      const newNalco = new Nalco({
        nalcoPrice,
        date: new Date(),
      });

      const savedNalco = await newNalco.save();

      return {
        message: "Nalco created successfully.",
        nalco: savedNalco,
      };
    } else {
      nalco.nalcoPrice = nalcoPrice;
      nalco.date = new Date();

      const updatedNalco = await nalco.save();

      return {
        message: "Nalco updated successfully.",
        nalco: updatedNalco,
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};



const runJob = async () => {

  const price = await downloadPdf();

  console.log('Price sending', price);

  if (price) {
    const res = await updateNalcoPrice(price);
    if (res) {
      console.log("Database updated successfully via service");
    } else {
      console.log("Failed to save new price");
    }
    
  }
};

cron.schedule("0 0 * * *", runJob);
console.log("Cron job scheduled");
