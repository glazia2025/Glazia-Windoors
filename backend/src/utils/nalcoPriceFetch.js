const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const pdfParse = require("pdf-parse");

const parsePdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const lines = data.text.split("\n").map(line => line.trim()).filter(Boolean);

    let basicPrice = null;

    for (let i = 0; i < lines.length - 1; i++) {
      // Looking for line that is just "1"
      if (lines[i] === "1") {
        const nextLine = lines[i + 1];
        const match = nextLine.match(/IA10(\d{5,6})/); // Match product code + price
        if (match) {
          basicPrice = match[1]; // Extract only price
          break;
        }
      }
    }

    if (basicPrice) {
        const price = Number(basicPrice).toFixed(2)/1000;
        console.log(`Fetched Price for Date ${new Date()}: ${price}`);
      return price;
    } else {
      console.warn("Could not extract Basic Price for row 1");
      return null;
    }
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return null;
  }
};
const downloadPdf = async () => {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments("--no-sandbox");

    const driver = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('https://nalcoindia.com/domestic/current-price/');
        const priceDiv = await driver.findElement(By.css(".price-div a"));
        const pdfUrl = await priceDiv.getAttribute("href");
        console.log("PDF URL:", pdfUrl);

        const pdfPath = path.join(__dirname, "nalco_price.pdf");
        const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(pdfPath, response.data);
        console.log("pdfPath", pdfPath);
        const price = parsePdf(pdfPath);

        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log("Temporary PDF file deleted");
        }

        return price;
    } catch (error) {
        console.error("Error in downloadPdf:", error);
    } finally {
        await driver.quit();
    }
}

module.exports = {
    downloadPdf
}