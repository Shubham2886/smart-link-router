import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-_]+$/, "Alias can only contain letters, numbers, hyphens and underscores"],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    iosUrl: { type: String, trim: true, default: "" },
    androidUrl: { type: String, trim: true, default: "" },
    fallbackUrl: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Link || mongoose.model("Link", LinkSchema);
