const mongoose = require('mongoose');
const HardwareOptions = require('../models/Hardware');

const addHardware = async (req, res) => {
    const { option, product } = req.body;
  
    console.log("Received request to add hardware with data:", req.body);
  
    // Check if option and product are provided
    if (!product) {
      console.log("Missing required fields: option or product");
      return res.status(400).json({ message: 'Option and product details are required' });
    }
  
    try {
      // Step 1: Find the existing hardware options document or create a new one
      let hardwareOptions = await HardwareOptions.findOne({});
  
      if (!hardwareOptions) {
        console.log("Hardware options not found, creating a new document.");
        hardwareOptions = new HardwareOptions({
          options: [],
          products: new Map(),
        });
        await hardwareOptions.save();
        console.log("New hardware options document created.");
      }
  
      // Step 2: Add the option if it doesn't exist
      if (!hardwareOptions.options.includes(option)) {
        console.log(`Option '${option}' does not exist, adding it.`);
        hardwareOptions.options.push(option);
      }
  
      // Step 3: Initialize products map for the option if it doesn't exist
      if (!hardwareOptions.products.has(option)) {
        console.log(`Option '${option}' does not have products, initializing.`);
        hardwareOptions.products.set(option, []);
      }
  
      // Step 4: Add the product to the option
      const productsArray = hardwareOptions.products.get(option);
      productsArray.push(product);
      hardwareOptions.products.set(option, productsArray);
  
      console.log(`Product added under option '${option}':`, product);
  
      // Step 5: Save the updated hardware options document
      await hardwareOptions.save();
      console.log("Hardware options updated successfully.");
  
      res.status(200).json({ message: 'Product added successfully', hardwareOptions });
    } catch (error) {
      console.error("Error occurred while adding product:", error);
      res.status(500).json({ message: 'Error updating the product' });
    }
};

const getHardwares = async (req, res) => {
  try {
    const hardwareOptions = await HardwareOptions.findOne({});
    if (!hardwareOptions) {
      return res.status(404).json({ message: 'Profile options not found' });
    }
    res.status(200).json(hardwareOptions);
  } catch (error) {
    console.error("Error fetching profile options:", error);
    res.status(500).json({ message: 'Error fetching profile options' });
  }
};


const addAllProducts = async (req, res) => {
  try {
    let hardwareItems = req.body;
  
    // Update the document with the specified _id
    const result = await HardwareOptions.updateOne(
      { _id: new mongoose.Types.ObjectId("6787b6c444cfc9207760c89c") },
      { 
        $push: { 
          "products.HANDLES": { 
            $each: hardwareItems
          }
        }
      }
    );

    console.log('Document updated:', result.modifiedCount);
    res.status(200).json({ message: 'Products added successfully'});
  } catch (err) {
    console.error('Error updating document:', err);
  } finally {
    // Close the Mongoose connection
    mongoose.connection.close();
  }
}

const editHardware = async (req, res) => {
  const { option, productId } = req.params;
  const updatedData = req.body;

  // Define mandatory fields
  const mandatoryFields = ["sapCode", "perticular", "subCategory", "rate", "system", "moq"];

  // Check if any mandatory field is missing
  const missingFields = mandatoryFields.filter(field => !(field in updatedData));

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing mandatory fields: ${missingFields.join(", ")}`
    });
  }

  try {
    // Find the product and update it
    const result = await HardwareOptions.updateOne(
      { [`products.${option}._id`]: productId },
      { $set: { [`products.${option}.$`]: updatedData } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Product not found or no changes made.' });
    }

    res.status(200).json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteHardware = async (req, res) => {
  const { option, productId } = req.params;

  try {
    const hardwareOptions = await HardwareOptions.findOne({});
    if (!hardwareOptions) {
      return res.status(404).json({ message: 'Profile options not found' });
    }

    console.log("option", productId);
    const productsArray = hardwareOptions.products.get(option);
    if (!productsArray) {
      return res.status(404).json({ message: 'Option not found' });
    }

    // Find the product by ID and delete it
    console.log("productsArray", productsArray)
    const productIndex = productsArray.findIndex(product => {
      return product._id.toString() === productId;
    });

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    productsArray.splice(productIndex, 1); // Remove the product from the array
    if (productsArray.length === 0) {
      hardwareOptions.products.delete(option);
    } else {
      // Otherwise, update the map with the modified array
      hardwareOptions.products.set(option, productsArray);
    }

    // Mark the specific field as modified
    hardwareOptions.markModified(`products`);

    await hardwareOptions.save(); // Save changes to the database

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

const searchHardware = async (req, res) => {
  const { sapCode, perticular, option } = req.query;

  if (!sapCode && !perticular && !option) {
    return res.status(400).json({ message: 'Provide sapCode, perticular or option to search' });
  }

  try {
    const hardwareOptions = await HardwareOptions.findOne({});
    if (!hardwareOptions) {
      return res.status(404).json({ message: 'No products found' });
    }
    console.log("kjhvjkeh 2");

    const matchedProducts = [];
    hardwareOptions.products.get(option).forEach(product => {
      if((sapCode && product.sapCode === sapCode) || perticular && product.perticular.match(new RegExp(perticular, 'i'))) {
        matchedProducts.push(product);
      }
    });

    res.status(200).json({ products: matchedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error searching products' });
  }
};

const saveProductImage = async (req, res) => {
  try {
    const productImagesData = req.body; // Array of {productCode, image}
    
    // Get all unique product codes
    const productCodes = productImagesData.map(item => item.productCode);
    
    // Get the HardwareOptions document
    const hardwareOptions = await HardwareOptions.findOne();
    if (!hardwareOptions) {
      return res.status(404).json({ error: 'Hardware options not found' });
    }

    // Keep track of updates
    const updatedProducts = [];
    const notFoundProducts = [];

    // Iterate through each product category in the products Map
    for (const [category, products] of hardwareOptions.products.entries()) {
      // For each product in the category
      products.forEach((product, index) => {
        // Find matching product image data
        const matchingImageData = productImagesData.find(
          imgData => imgData.productCode === product.sapCode
        );

        if (matchingImageData) {
          // Update the product's image
          hardwareOptions.products.get(category)[index].image = matchingImageData.image;
          updatedProducts.push({
            category,
            sapCode: product.sapCode,
            perticular: product.perticular
          });
        }
      });
    }

    // Find products that weren't updated
    productImagesData.forEach(imgData => {
      const found = updatedProducts.some(up => up.sapCode === imgData.productCode);
      if (!found) {
        notFoundProducts.push(imgData.productCode);
      }
    });

    // Save the updated document
    await hardwareOptions.save();

    // Return response with results
    res.json({
      success: true,
      updated: updatedProducts.length,
      updatedProducts,
      notFound: notFoundProducts.length,
      notFoundProducts
    });

  } catch (error) {
    console.error('Error saving product images:', error);
    res.status(500).json({
      error: 'Failed to save product images',
      message: error.message
    });
  }
};

const getHardwareHeirarchy = async (req, res) => {
  try {
    const hardwareOptions = await HardwareOptions.findOne({});
    if (!hardwareOptions) {
      return res.status(404).json({ message: 'No profile found' });
    }
    console.log("hardwareOptions", hardwareOptions)
    const finalObject = Array.from(hardwareOptions.options).map(profile => profile);
    res.status(200).json({ products: finalObject });
  } catch (error) {
    res.status(500).json({ message: 'Error getting profiles' });
  }
}

module.exports = { addHardware, getHardwares, addAllProducts, editHardware, deleteHardware, searchHardware, saveProductImage, getHardwareHeirarchy };