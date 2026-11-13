import FortnightCycle from "../models/FortnightCycle.js";

/**
 * GET /api/cycles
 * Returns all fortnight cycles for the ENT 3805 semester.
 */
export const getCycles = async (req, res) => {
  try {
    const cycles = await FortnightCycle.find().sort({ cycleNumber: 1 });
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
