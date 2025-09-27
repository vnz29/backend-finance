import mongoose from "mongoose";
import Purchase from "../models/purchaseModel.js";

export const getCurrentPurchase = async (req, res) => {
  const userID = req.query.userID;
  // console.log("napasok");
  // const today = new Date();
  // const startOfDay = new Date(today);
  // startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000 (start of today)

  // // Get the end of today (just before midnight of the next day)
  // const endOfDay = new Date(today);
  // endOfDay.setHours(23, 59, 59, 999); // Se
  const todayUTC = new Date(); // current UTC date/time

  // Get UTC year/month/day
  const year = todayUTC.getUTCFullYear();
  const month = todayUTC.getUTCMonth();
  const day = todayUTC.getUTCDate();

  // Start of day in UTC
  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  // End of day in UTC
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  console.log(startOfDay, endOfDay);
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
  const { start_date, end_date, userID } = req.query;

  if (!userID) {
    return res.status(400).json({ error: "userID is required" });
  }

  // Cast userID to ObjectId
  let match = {
    userId: new mongoose.Types.ObjectId(userID),
    isDeleted: false,
  };

  if (start_date || end_date) {
    match.createdAt = {};

    if (start_date) {
      const [year, month, day] = start_date.split("-").map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

      if (isNaN(startDate))
        return res.status(400).json({ error: "Invalid start_date" });

      match.createdAt.$gte = startDate;
    }

    if (end_date) {
      const [year, month, day] = end_date.split("-").map(Number);
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      if (isNaN(endDate))
        return res.status(400).json({ error: "Invalid end_date" });

      match.createdAt.$lte = endDate;
    }
  }
  try {
    console.log(match);
    const events = await Purchase.aggregate([
      [
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            purchases: { $push: "$$ROOT" },
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: -1 } },

        // Add this block ⬇️ to compute grand totals and structure response
        {
          $group: {
            _id: null,
            days: { $push: "$$ROOT" },
            totalAmount: { $sum: "$totalAmount" },
            totalCount: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmount: 1,
            totalCount: 1,
            days: 1,
          },
        },
      ],
    ]);
    console.log(events);
    res.json(events);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({
      error: "An error occurred while grouping the purchases",
    });
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
