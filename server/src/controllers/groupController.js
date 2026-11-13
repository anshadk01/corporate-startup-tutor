import Group from "../models/Group.js";
import Reflection from "../models/Reflection.js";
import News from "../models/News.js";
import PromptLog from "../models/PromptLog.js";

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("memberIds", "name email rollNumber role")
      .populate("instructorId", "name email");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("memberIds", "name email rollNumber role")
      .populate("instructorId", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const [reflectionCount, newsCount, logCount] = await Promise.all([
      Reflection.countDocuments({ groupId: group._id }),
      News.countDocuments({ groupId: group._id }),
      PromptLog.countDocuments({ groupId: group._id })
    ]);

    res.json({
      ...group.toObject(),
      stats: {
        reflections: reflectionCount,
        news: newsCount,
        promptLogs: logCount,
        completionPercentage: Math.min(100, Math.round((reflectionCount / 13) * 100))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};