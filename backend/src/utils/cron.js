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



const runJob = async () => {

  const price = await downloadPdf();
  fs.unlinkSync(filePath);

  if (price) {
    await updateNalcoPrice(price);
    console.log("Database updated successfully via service");
  }
};

cron.schedule("0 0 * * *", runJob);
console.log("Cron job scheduled");


