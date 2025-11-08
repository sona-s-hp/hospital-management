import express from "express";
import PharmacyStock from "../models/pharmacyStock.js";
import Alert from "../models/alert.js";
import StockRequest from "../models/stockRequest.js";

const router = express.Router();

/**
 * Initialize stock for a new pharmacy
 * POST /api/pharmacy/init/:pharmacyId
 * body: { medicines: [{ name, qty }] }
 */
router.post("/init/:pharmacyId", async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { medicines = [] } = req.body;
    const existing = await PharmacyStock.findOne({ pharmacyId });
    if (existing) return res.json({ success: false, message: "Already initialized" });

    const newStock = new PharmacyStock({ pharmacyId, medicines });
    await newStock.save();
    res.json({ success: true, message: "Stock initialized", stock: newStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Get stock for pharmacy
 * GET /api/pharmacy/stock/:pharmacyId
 */
router.get("/stock/:pharmacyId", async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const stock = await PharmacyStock.findOne({ pharmacyId });
    res.json({ success: true, stock: stock ? stock.medicines : [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Update current stock quantities (bulk)
 * POST /api/pharmacy/updatestock
 * body: { pharmacyId, stock: { "Paracetamol": 12, "Ibuprofen": 5 } }
 *
 * When qty <= 10, create an Alert AND create a StockRequest (unless an open request exists).
 */
router.post("/updatestock", async (req, res) => {
  try {
    const { pharmacyId, stock } = req.body;
    if (!pharmacyId || !stock) return res.status(400).json({ success: false, message: "Missing params" });

    let doc = await PharmacyStock.findOne({ pharmacyId });
    if (!doc) {
      doc = new PharmacyStock({ pharmacyId, medicines: [] });
    }

    for (const [name, qty] of Object.entries(stock)) {
      const qtyNum = Number(qty) || 0;
      const med = doc.medicines.find((m) => m.name === name);
      if (med) med.qty = qtyNum;
      else doc.medicines.push({ name, qty: qtyNum });

      // If low — alert and create request (prevent duplicate requests)
      if (qtyNum <= 10) {
        await Alert.create({
          pharmacyId,
          medicine: name,
          message: `Low stock alert: ${name} only ${qtyNum} left`,
        });

        const existingRequest = await StockRequest.findOne({
          pharmacyId,
          medicine: name,
          status: "requested",
        });

        if (!existingRequest) {
          // default requestedQty: 50 (or a safe restock amount). Admin may change
          await StockRequest.create({
            pharmacyId,
            medicine: name,
            requestedQty: 50,
          });
        }
      }
    }

    await doc.save();
    res.json({ success: true, message: "Stock updated", stock: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Reduce stock after dispensing
 * POST /api/pharmacy/reduce
 * body: { pharmacyId, medicines: [{ name, qty }] }
 *
 * When qty falls <= 10, create Alert / StockRequest if not already present.
 */
router.post("/reduce", async (req, res) => {
  try {
    const { pharmacyId, medicines } = req.body;
    if (!pharmacyId || !Array.isArray(medicines)) return res.status(400).json({ success: false, message: "Missing params" });

    const stock = await PharmacyStock.findOne({ pharmacyId });
    if (!stock) return res.status(404).json({ success: false, message: "Stock not found" });

    for (const m of medicines) {
      const med = stock.medicines.find((x) => x.name === m.name);
      const reduceQty = Number(m.qty) || 0;
      if (med) {
        med.qty = Math.max(0, med.qty - reduceQty);

        if (med.qty <= 10) {
          await Alert.create({
            pharmacyId,
            medicine: m.name,
            message: `Low stock alert: ${m.name} only ${med.qty} left`,
          });

          const existingRequest = await StockRequest.findOne({
            pharmacyId,
            medicine: m.name,
            status: "requested",
          });

          if (!existingRequest) {
            await StockRequest.create({
              pharmacyId,
              medicine: m.name,
              requestedQty: 50,
            });
          }
        }
      }
    }

    await stock.save();
    res.json({ success: true, message: "Stock reduced", stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Increase stock (used by admin approval)
 * POST /api/pharmacy/increase
 * body: { pharmacyId, medicines: [{ name, qty }] }
 */
router.post("/increase", async (req, res) => {
  try {
    const { pharmacyId, medicines } = req.body;
    if (!pharmacyId || !Array.isArray(medicines)) return res.status(400).json({ success: false, message: "Missing params" });

    const stock = await PharmacyStock.findOne({ pharmacyId });
    if (!stock) return res.status(404).json({ success: false, message: "Stock not found" });

    for (const m of medicines) {
      const qtyToAdd = Number(m.qty) || 0;
      const med = stock.medicines.find((x) => x.name === m.name);
      if (med) med.qty += qtyToAdd;
      else stock.medicines.push({ name: m.name, qty: qtyToAdd });

      // create alert to notify pharmacy about approval/added stock
      await Alert.create({
        pharmacyId,
        medicine: m.name,
        message: `Stock increased: ${m.name} +${qtyToAdd}`,
      });
    }

    await stock.save();
    res.json({ success: true, message: "Stock increased", stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Fetch alerts
 * GET /api/pharmacy/alerts/:pharmacyId
 */
router.get("/alerts/:pharmacyId", async (req, res) => {
  try {
    const alerts = await Alert.find({ pharmacyId: req.params.pharmacyId }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
