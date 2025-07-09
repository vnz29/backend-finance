import Purchase from "../models/purchaseModel.js";

export const getCurrentPurchase = async (req, res) => {
  const userID = req.query.userID;
  console.log("napasok");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000 (start of today)

  // Get the end of today (just before midnight of the next day)
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // Se
  try {
    const item = await Purchase.find({
      userId: userID,
      isDeleted: false,
      createdAt: {
        // Using createdAt field from timestamps
        $gte: startOfDay, // Greater than or equal to the start of today
        $lt: endOfDay, // Less than the end of today
      },
    }).sort({ createdAt: -1 });
    console.log(item);
    res.status(201).json({ message: "Items are succefully fetched", item });
  } catch (error) {
    console.log("error");
    res.status(500).send("Error fetching the items");
  }
};
export const getSpecificPurchase = async (req, res) => {
  const { userID } = req.body;
  const { start_date, end_date } = req.query;
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  startDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000 (start of today)
  endDate.setHours(23, 59, 59, 999); // Se

  // Initialize the filter object
  let filter = {};

  if (start_date || end_date) {
    filter.createdAt = {};
  }

  if (start_date) {
    filter.createdAt.$gte = new Date(start_date); // Greater than or equal to start_date
  }

  if (end_date) {
    filter.createdAt.$lte = new Date(end_date); // Less than or equal to end_date
  }

  try {
    const events = await Purchase.find({
      userId: userID,
      isDeleted: false,
      createdAt: {
        // Using createdAt field from timestamps
        $gte: startDate, // Greater than or equal to the start of today
        $lt: endDate, // Less than the end of today
      },
    }); // Query the events using the filter
    res.json(events); // Return the filtered events
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the items" });
  }
};

export const addPurchase = async (req, res) => {
  const { name, amount, userID } = req.body;

  try {
    // Create a new user instance
    const item = new Purchase({
      name,
      amount,
      isDeleted: false,
      userId: userID,
    });

    // Save the user to the database
    await item.save();

    // Send response
    res.status(201).json({ message: "Item is succefully added", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const PurchaseID = req.params.id;
    const updatedPurchase = req.body;

    const item = await Purchase.findByIdAndUpdate(PurchaseID, updatedPurchase, {
      new: true, // Return the updated document
      runValidators: true, // Ensure that the update meets schema validation
    });

    if (!item) {
      return res.status(404).json({ message: "Purchased Item not found" });
    }

    res.json({ item, message: "Item successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const deletePurchase = async (req, res) => {
  console.log("test delete page");
  const PurchaseID = req.params.id;
  const updatedPurchase = req.body;
  try {
    const item = await Purchase.findByIdAndUpdate(PurchaseID, updatedPurchase, {
      new: true, // Return the updated document
      runValidators: true, // Ensure that the update meets schema validation
    });
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.status(200).json({ message: "Purchase Successfully Deleted" });
  } catch (error) {
    res.status(500).send("Error deleting item");
  }
};
