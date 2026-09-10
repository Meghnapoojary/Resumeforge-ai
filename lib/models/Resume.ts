import mongoose, { Schema, models, model } from "mongoose";

const ExperienceSchema = new Schema(
  {
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    bullets: [String],
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    school: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
  },
  { _id: false }
);

const SkillGroupSchema = new Schema(
  {
    category: String,
    items: [String],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: String,
    description: String,
    bullets: [String],
    link: String,
    image: String,
  },
  { _id: false }
);

const CustomSectionSchema = new Schema(
  {
    title: String,
    items: [String],
  },
  { _id: false }
);

const ResumeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, default: "Untitled resume" },
    templateId: { type: String, default: "editorial" },
    theme: {
      accent: { type: String, default: "#2255D8" },
      density: { type: String, default: "comfortable" },
    },
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, index: true },
    contact: {
      name: String,
      title: String,
      email: String,
      phone: String,
      location: String,
      links: [String],
    },
    photo: { type: String, default: "" }, // base64 data URL, resized client-side before saving
    summary: { type: String, default: "" },
    experience: [ExperienceSchema],
    education: [EducationSchema],
    skills: [SkillGroupSchema],
    projects: [ProjectSchema],
    // Mixed keeps existing string certificates compatible while allowing rich certificate entries.
    certifications: [Schema.Types.Mixed],
    customSections: [CustomSectionSchema],
    // Snapshots for lightweight version history
    versions: [
      {
        savedAt: { type: Date, default: Date.now },
        snapshot: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

export type ResumeDocument = mongoose.InferSchemaType<typeof ResumeSchema>;

export const Resume = models.Resume || model("Resume", ResumeSchema);
