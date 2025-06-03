const { default: mongoose } = require('mongoose');
const ProfileOptions = require('../models/ProfileOptions');
const TechnicalSheet = require('../models/TechSheet');
const { escapeRegExp } = require('../utils/common');

const addProduct = async (req, res) => {
  const { category, option, product, rate } = req.body;

  console.log("Received request to add product with data:", req.body);  // Log the received request payload

  // Check if category, option, and product are provided
  if (!category || !option) {
    console.log("Missing required fields: category, option, or product");  // Log if any required field is missing
    return res.status(400).json({ message: 'Category, option, and product details are required' });
  }

  try {
    // Step 1: Find the existing profile options document or create a new one if it doesn't exist
    let profileOptions = await ProfileOptions.findOne({});

    // If profileOptions doesn't exist, create one
    if (!profileOptions) {
      console.log("Profile options not found, creating a new document.");
      profileOptions = new ProfileOptions({
        categories: new Map(),  // Initialize categories as a Map
      });
      await profileOptions.save();
      console.log("New profile options document created.");
    }
    console.log("profileOptions----------------------------------", profileOptions)

    // Step 2: Check if the category exists, if not, create it
    console.log("Checking if category exists:", category);
    if (!profileOptions.categories.has(category)) {
      console.log(`Category '${category}' does not exist, creating new category`);
      profileOptions.categories.set(category, {
        options: [],
        products: new Map(),
      });
    }

    // Step 3: Get the category data
    const categoryData = profileOptions.categories.get(category);
    console.log("Category data after check:", categoryData);  // Log the category data

    // Step 4: Check if the option exists, if not, create it
    console.log("Checking if option exists:", option);
    if (!categoryData.options.includes(option)) {
      console.log(`Option '${option}' does not exist in category '${category}', adding it.`);
      categoryData.options.push(option);
    }

    // categoryData.rate[option] = rate;
    if (!profileOptions.categories.get(category).rate) {
      const updatedRate = new Map(); // Create an empty Map instead of a plain object
      
      profileOptions.categories.get(category).set('rate', updatedRate); // Set the new Map as rate
    }
    
    profileOptions.categories.get(category).rate.set(option, rate); // Use set() to add key-value pairs in Map
    
    // Step 5: Add the product under the specified option
    console.log("Checking if option has products:", option);

    if(!product) {
      await profileOptions.save();
      res.status(200).json({ message: 'Product added successfully', profileOptions });
      return;
    }

    if (!categoryData.products) {
      categoryData.products = new Map();
    }

    if (!categoryData.products.has(option)) {
      console.log(`Option '${option}' does not have products, initializing the products array.`);
      categoryData.products.set(option, []);
    }

    const productsArray = categoryData.products.get(option);
    console.log("Current products array under the option:", productsArray);  // Log the current products in the option

    productsArray.push(product);  // Add the new product
    console.log("Product added:", product);  // Log the product that was added

    // Step 6: Save the updated profile options document
    await profileOptions.save();
    console.log("Profile options saved successfully");

    // Return the updated profile options
    res.status(200).json({ message: 'Product added successfully', profileOptions });

  } catch (error) {
    console.error("Error occurred while adding product:", error);
    res.status(500).json({ message: 'Error updating the product' });
  }
};

const getProducts = async (req, res) => {
  try {
    const profileOptions = await ProfileOptions.findOne({});
    if (!profileOptions) {
      return res.status(404).json({ message: 'Profile options not found' });
    }
    res.status(200).json(profileOptions);
  } catch (error) {
    console.error("Error fetching profile options:", error);
    res.status(500).json({ message: 'Error fetching profile options' });
  }
};

const editProduct = async (req, res) => {
  const { category, productType, productId } = req.params;
  const updatedData = req.body;

  // Define mandatory fields
  const mandatoryFields = ["sapCode", "part", "description", "degree", "per", "kgm", "length"];

  // Check if any mandatory field is missing
  const missingFields = mandatoryFields.filter(field => !(field in updatedData));

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing mandatory fields: ${missingFields.join(", ")}`
    });
  }

  try {
    // Find the product and update it
    const result = await ProfileOptions.updateOne(
      { [`categories.${category}.products.${productType}._id`]: productId },
      { $set: { [`categories.${category}.products.${productType}.$`]: updatedData } }
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

const deleteProduct = async (req, res) => {
  const { category, productType, productId } = req.params;

  try {
    const profileOptions = await ProfileOptions.findOne({});
    if (!profileOptions) {
      return res.status(404).json({ message: 'Profile options not found' });
    }

    // Find the category and option
    const categoryData = profileOptions.categories.get(category);
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log("option", productId);
    const productsArray = categoryData.products.get(productType);
    if (!productsArray) {
      return res.status(404).json({ message: 'Option not found' });
    }

    // Find the product by ID and delete it
    console.log("productsArray", productsArray)
    const productIndex = productsArray.findIndex(product => {
      console.log("ajhghj", product._id);
      return product._id.toString() === productId;
    });
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    productsArray.splice(productIndex, 1); // Remove the product from the array
    console.log("productsArray", productsArray);
    if (productsArray.length === 0) {
      // If no products are left, delete the option from the map
      categoryData.products.delete(productType);
    } else {
      // Otherwise, update the map with the modified array
      categoryData.products.set(productType, productsArray);
    }

    // Mark the specific field as modified
    profileOptions.markModified(`categories.${category}.products`);

    await profileOptions.save(); // Save changes to the database

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

const searchProduct = async (req, res) => {
  console.log("Cioehjkhjdhf", req.query)
  const { sapCode, description, profile, option } = req.query;

  if ((!sapCode || !sapCode.trim()) && (!description || !description.trim()) && !profile && !option) {
    return res.status(400).json({ message: 'Provide sapCode, description, profile, or option to search' });
  }

  try {
    const profileOptions = await ProfileOptions.findOne({});
    if (!profileOptions) {
      return res.status(404).json({ message: 'No products found' });
    }
    const matchedProducts = [];
    profileOptions.categories.get(profile).products.get(option).forEach(product => {
      if (
        (sapCode && sapCode.trim() &&
          product.sapCode.match(new RegExp(escapeRegExp(sapCode.trim()), "i"))) ||
        (description && description.trim() &&
          product.description.match(
            new RegExp(escapeRegExp(description.trim()), "i")
          ))
      ) {
        matchedProducts.push(product);
      }
    });

    res.status(200).json({ products: matchedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error searching products' });
  }
};

const getProfileHierarchy = async (req, res) => {
  try {
    const profileOptions = await ProfileOptions.findOne({});
    if (!profileOptions) {
      return res.status(404).json({ message: 'No profile found' });
    }
    const finalObject = Array.from(profileOptions.categories.keys()).map(profile => {
      return {
        profile,
        options: profileOptions.categories.get(profile).options // Corrected here to use get()
      };
    });
    res.status(200).json({ products: finalObject });
  } catch (error) {
    res.status(500).json({ message: 'Error getting profiles' });
  }
}

const updateTechSheet = async (req, res) => {
  const { main, category, subCategory, shutterHeight, shutterWidth, lockingMechanism, glassSize, alloy, interlock } = req.body;

  if (!main || !category || !subCategory) {
    return res.status(400).json({ message: 'Please provide category / subCategory' });
  }

  try {
    let techSheet = await TechnicalSheet.findOne({ main, category, subCategory });

    // Create a new tech sheet if it doesn't exist
    if (!techSheet) {
      techSheet = new TechnicalSheet({
        main,
        category,
        subCategory,
        shutterHeight,
        shutterWidth,
        lockingMechanism,
        glassSize,
        alloy,
        interlock,
      });

      const savedTechSheet = await techSheet.save();
      return res.status(201).json({
        message: 'Technical Sheet Added Successfully',
        techSheet: savedTechSheet,
      });
    }

    // Update existing tech sheet
    techSheet.set({
      shutterHeight,
      shutterWidth,
      lockingMechanism,
      glassSize,
      alloy,
      interlock,
    });

    const updatedTechSheet = await techSheet.save();
    return res.status(200).json({
      message: 'Technical Sheet updated successfully.',
      techSheet: updatedTechSheet,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

const getTechSheet = async (req, res) => {
  try {
    const { main, category, subCategory } = req.query;
    console.log("ma--", main, category, subCategory);

    if (!main || !category || !subCategory) {
      return res.status(400).json({ message: 'Missing required parameters: main, category, subCategory' });
    }

    const sheet = await TechnicalSheet.findOne({ main, category, subCategory });

    if (!sheet) {
      return res.status(200).json({ });
    }

    res.status(200).json(sheet);
  } catch (error) {
    console.error("Error fetching sheet:", error);
    res.status(500).json({ message: 'Error fetching sheet', error: error.message });
  }
};

async function updateDocument() {
  try {
    const newProducts = [
      {
        id: 1,
        sapCode: "H-01-02-23",
        part: "",
        degree: "45",
        description: "Frame (Vertical)",
        per: "Kg",
        kgm: 1.77,
        length: "4880",
        image: ""
      },
      {
        id: 2,
        sapCode: "H-02-03-23",
        part: "",
        degree: "45",
        description: "Frame (Top)",
        per: "Kg",
        kgm: 2.1,
        length: "4880",
        image: ""
      },
      {
        id: 3,
        sapCode: "H-03-03-23",
        part: "",
        degree: "45",
        description: "Frame (Bottom)",
        per: "Kg",
        kgm: 1.84,
        length: "4880",
        image: ""
      },
      {
        id: 4,
        sapCode: "H-04-03-23",
        part: "",
        degree: "45",
        description: "Shutter",
        per: "Kg",
        kgm: 2.0,
        length: "4880",
        image: ""
      },
      {
        id: 5,
        sapCode: "H-05-03-23",
        part: "",
        degree: "45",
        description: "Bead (24mm Glass)",
        per: "Kg",
        kgm: 0.26,
        length: "4880",
        image: ""
      },
      {
        id: 6,
        sapCode: "H-06-03-23",
        part: "",
        degree: "45",
        description: "Fake Mullion",
        per: "Kg",
        kgm: 0.98,
        length: "4880",
        image: ""
      },
      {
        id: 7,
        sapCode: "H-01-03-23",
        part: "",
        degree: "45",
        description: "Big Clip for Bottom",
        per: "Kg",
        kgm: 0.35,
        length: "4880",
        image: ""
      },
      {
        id: 8,
        sapCode: "S-02-03-23",
        part: "",
        degree: "45",
        description: "Small Clip for Bottom",
        per: "Kg",
        kgm: 0.22,
        length: "4880",
        image: ""
      },
      {
        id: 9,
        sapCode: "H-10-03-23",
        part: "",
        degree: "45",
        description: "Fake Mullion",
        per: "Kg",
        kgm: 1.0,
        length: "4880",
        image: ""
      }
    ]
    
  
  
    // Update the document with the specified _id
    const result = await ProfileOptions.updateOne(
      { _id: new mongoose.Types.ObjectId("6783f753ba72953976026092") },
      { 
        $push: { 
          "categories.Slide and Fold.products.3m": { 
            $each: newProducts
          }
        }
      }
    );

    console.log('Document updated:', result.modifiedCount);
  } catch (err) {
    console.error('Error updating document:', err);
  } finally {
    // Close the Mongoose connection
    mongoose.connection.close();
  }
}

// updateDocument();

module.exports = { addProduct, getProducts, editProduct, deleteProduct, searchProduct, getProfileHierarchy, updateTechSheet, getTechSheet };
