const cron = require("node-cron");
const fs = require("fs");
const { Nalco } = require("../models/Order");
const User = require('../models/User');
const { downloadPdf } = require("./nalcoPriceFetch");
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendNalcoMessageToUsers = async (nalcoPrice) => {
  try {
    // Logic to send message to users
    console.log("Sending Nalco price to users:", nalcoPrice);
    const users = await User.find();
    console.log(`Found ${users.length} users to notify`);
    for(const user of users) {
      if (user.phoneNumber) {
        console.log(`Sending message to ${user.phoneNumber}`);
        try {
const message = await client.messages.create({
    body: `🌞 Good Morning from Glazia!
📊 Today's NALCO Aluminium CH10 Billet Rate: ₹${nalcoPrice/1000}/kg
📍Updated as of ${new Date().toLocaleDateString()}

For bulk orders or pricing, reach out to us at www.glazia.in
Let's build something amazing today! 💪

— Team Glazia 🪟`,  // Simple SMS body
      from: `${process.env.TWILIO_SMS_NUMBER}`,  // Your Twilio SMS number
      to: `+91${user.phoneNumber}`
    });

    console.log("SMS sent:", message.sid);
        } catch (error) {
          console.error(`Error sending message to ${user.phoneNumber}:`, error);
        }
      }
    }
    
  } catch (error) {
    console.error('Error sending SMS message:', error);
  }
}


const updateNalcoPrice = async (nalcoPrice) => {
  try {
    const now = new Date();

    // Detect server timezone
    const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log("Server timezone:", serverTimeZone);

    // Calculate today's start and end based on timezone
    let todayStart, todayEnd;

    if (serverTimeZone === "Asia/Calcutta" || serverTimeZone === "Asia/Kolkata") {
      // If already in IST, no need to offset
      todayStart = new Date(now.setHours(0, 0, 0, 0));
      todayEnd = new Date(now.setHours(23, 59, 59, 999));
    } else {
      // Server is in UTC or another timezone, adjust to IST
      const istOffset = 5.5 * 60 * 60 * 1000;
      todayStart = new Date(now.setHours(0, 0, 0, 0) - istOffset);
      todayEnd = new Date(now.setHours(23, 59, 59, 999) - istOffset);
    }

    
      sendNalcoMessageToUsers(nalcoPrice);

    // Find the latest entry for today
    const existingEntry = await Nalco.findOne({
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: -1 });

    console.log("Existing entry found:", existingEntry);
    console.log("Today's start:", todayStart);
    console.log("Today's end:", todayEnd);

    if (!existingEntry) {
      console.log("No existing entry found for today, creating a new one.");
      const newNalco = new Nalco({
        nalcoPrice,
        date: new Date(),
      });

      const savedNalco = await newNalco.save();

      return {
        message: "Nalco created for today.",
        nalco: savedNalco,
      };
    } else {
      console.log("Existing entry found, checking price...");
      // If the price has changed, update the existing entry
      console.log("Existing price:", existingEntry.nalcoPrice);
      console.log("New price:", nalcoPrice);
      console.log("Price comparison:", existingEntry.nalcoPrice !== nalcoPrice);
      if (existingEntry.nalcoPrice !== nalcoPrice) {
        const newNalco = new Nalco({
          nalcoPrice,
          date: new Date(),
        });

        const savedNalco = await newNalco.save();

        return {
          message: "Nalco updated (new price for today).",
          nalco: savedNalco,
        };
      } else {
        return {
          message: "Nalco price unchanged. No update needed.",
          nalco: existingEntry,
        };
      }
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

runJob();

cron.schedule("0 8 * * *", runJob, {
  timezone: "Asia/Kolkata",
});
console.log("Cron job scheduled");
