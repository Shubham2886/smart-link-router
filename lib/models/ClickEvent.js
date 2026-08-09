import mongoose from "mongoose";

const ClickEventSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: "Link", required: true, index: true },
    alias: { type: String, required: true, index: true },
    platform: {
      type: String,
      enum: ["ios", "android", "desktop"],
      required: true,
      index: true,
    },
    ip: { type: String, default: "" },
    country: { type: String, default: "Unknown" },
    referrer: { type: String, default: "direct" },
    userAgent: { type: String, default: "" },
    destination: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ClickEventSchema.index({ link: 1, createdAt: -1 });

export default mongoose.models.ClickEvent || mongoose.model("ClickEvent", ClickEventSchema);
