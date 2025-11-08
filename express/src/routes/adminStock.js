import express from "express";
import StockRequest from "../models/stockRequest.js";
import PharmacyStock from "../models/pharmacyStock.js";

const router = express.Router();

/**
 * GET /api/admin/stockrequests
 * Query params optional: pharmacyId
 */
router.get("/stockrequests", async (req, res) => {
  try {
    const filter = {};
    if (req.query.pharmacyId) filter.pharmacyId = req.query.pharmacyId;
    const list = await StockRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/admin/stockrequests/approve
 * body: { requestId, approvedQty, processedBy (adminId), notes }
 *
 * Approving will:
 * - set request status to 'approved'
 * - add approvedQty to PharmacyStock for that medicine
 * - set processedAt & processedBy
 */
router.post("/stockrequests/approve", async (req, res) => {
  try {
    const { requestId, approvedQty, processedBy, notes } = req.body;
    const reqDoc = await StockRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });
    if (reqDoc.status !== "requested") return res.status(400).json({ success: false, message: "Request already processed" });

    // update pharmacy stock
    let stock = await PharmacyStock.findOne({ pharmacyId: reqDoc.pharmacyId });
    if (!stock) {
      stock = new PharmacyStock({ pharmacyId: reqDoc.pharmacyId, medicines: [] });
    }

    const med = stock.medicines.find((m) => m.name === reqDoc.medicine);
    const addQty = Number(approvedQty) || reqDoc.requestedQty || 0;
    if (med) med.qty += addQty;
    else stock.medicines.push({ name: reqDoc.medicine, qty: addQty });

    await stock.save();

    // update request
    reqDoc.status = "approved";
    reqDoc.processedAt = new Date();
    reqDoc.processedBy = processedBy;
    reqDoc.notes = notes || "";
    await reqDoc.save();

    res.json({ success: true, message: "Request approved", request: reqDoc, stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/admin/stockrequests/reject
 * body: { requestId, processedBy, notes }
 */
router.post("/stockrequests/reject", async (req, res) => {
  try {
    const { requestId, processedBy, notes } = req.body;
    const reqDoc = await StockRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });
    if (reqDoc.status !== "requested") return res.status(400).json({ success: false, message: "Request already processed" });

    reqDoc.status = "rejected";
    reqDoc.processedAt = new Date();
    reqDoc.processedBy = processedBy;
    reqDoc.notes = notes || "";
    await reqDoc.save();

    res.json({ success: true, message: "Request rejected", request: reqDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
