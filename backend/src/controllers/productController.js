const ProfileOptions = require('../models/ProfileOptions');

const addProduct = async (req, res) => {
  const { category, option, product } = req.body;

  console.log("Received request to add product with data:", req.body);  // Log the received request payload

  // Check if category, option, and product are provided
  if (!category || !option || !product) {
    console.log("Missing required fields: category, option, or product");  // Log if any required field is missing
    return res.status(400).json({ message: 'Category, option, and product details are required' });
  }

  try {
    // Step 1: Find the existing profile options document or create a new one if it doesn't exist
    let profileOptions = await ProfileOptions.findOne({});
    console.log("Found profile options:", profileOptions);  // Log the profile options found

    // If profileOptions doesn't exist, create one
    if (!profileOptions) {
      console.log("Profile options not found, creating a new document.");
      profileOptions = new ProfileOptions({
        categories: new Map(),  // Initialize categories as a Map
      });
      await profileOptions.save();
      console.log("New profile options document created.");
    }

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

    // Step 5: Add the product under the specified option
    console.log("Checking if option has products:", option);
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
    console.error("Error occurred while adding product:", error);  // Log any unexpected errors
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

module.exports = { addProduct, getProducts };
