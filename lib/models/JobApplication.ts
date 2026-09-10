import mongoose, { Schema, models, model } from "mongoose";

const JobApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    jobDescriptionText: { type: String, default: "" },
    coverLetterText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["applied", "interviewing", "offer", "rejected"],
      default: "applied",
    },
  },
  { timestamps: true }
);

export type JobApplicationDocument = mongoose.InferSchemaType<typeof JobApplicationSchema>;

export const JobApplication =
  models.JobApplication || model("JobApplication", JobApplicationSchema);
