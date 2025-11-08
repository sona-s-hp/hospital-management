import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔗 Foreign key to User model
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contact: { type: String },
    department: { type: String },
    hospital: { type: String },
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
