require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const mongoose = require("mongoose");
const EonetEvent = require("./models/EonetEvents");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

/**
 * FETCH + TRANSFORM DATA FROM NASA EONET
 */
const fetchEonetData = async () => {
  const res = await axios.get(
    "https://eonet.gsfc.nasa.gov/api/v3/events"
  );

  return res.data.events
    .map((event) => {
      const geometry = event.geometry?.[0] || {};

      return {
        id: event.id,
        title: event.title || "Unknown",
        categories: event.categories?.[0]?.title || "Unknown",
        magnitude: geometry.magnitudeValue ?? null,
        date: geometry.date || null,
        longitude: geometry.coordinates?.[0] ?? null,
        latitude: geometry.coordinates?.[1] ?? null,
      };
    })
    .filter((e) => e.id && e.title);
};

/**
 * SAFE SYNC (NO BULKWRITE = NO TIMEOUT BUGS)
 */
const syncEonetData = async () => {
  const events = await fetchEonetData();

  let processed = 0;

  for (const event of events) {
    await EonetEvent.updateOne(
      { id: event.id },
      { $set: event },
      { upsert: true }
    );

    processed++;
  }

  console.log(`[SYNC] Synced ${processed} events`);
  return {
    total: events.length,
    synced: processed,
  };
};

/**
 * START SERVER ONLY AFTER DB IS READY
 */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected, database:", mongoose.connection.db.databaseName);
    console.log("DB connected, starting initial sync...");

    syncEonetData().catch((err) =>
      console.error("[INITIAL SYNC ERROR]", err)
    );

    // hourly sync
    cron.schedule("0 * * * *", async () => {
      try {
        await syncEonetData();
      } catch (err) {
        console.error("[SYNC CRON ERROR]", err);
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
  }
})();

/**
 * MANUAL SYNC
 */
app.post("/api/sync", async (req, res) => {
  try {
    const result = await syncEonetData();
    res.json({ message: "Sync complete", ...result });
  } catch (err) {
    console.error("[SYNC ERROR]", err);
    res.status(500).json({ message: "Sync failed" });
  }
});

/**
 * GET EVENTS
 */
app.get("/api/events", async (req, res) => {
  try {
    const { category, limit = 500 } = req.query;

    const filter = {};
    if (category) filter.categories = category;

    const events = await EonetEvent.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("[EVENTS ERROR]", err);
    res.status(500).json({ message: "Failed to retrieve events" });
  }
});

/**
 * GET CATEGORIES
 */
app.get("/api/events/categories", async (req, res) => {
  try {
    const categories = await EonetEvent.distinct("categories");
    res.json(categories);
  } catch (err) {
    console.error("[CATEGORIES ERROR]", err);
    res.status(500).json({ message: "Failed to retrieve categories" });
  }
});