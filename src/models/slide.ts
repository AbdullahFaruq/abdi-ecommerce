import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Hero slides store ONLY the image. No title, no caption, no link:
 * the hero is an image slider with no text overlays.
 */
const SlideSchema = new Schema(
  {
    image: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false, strict: true }
);

SlideSchema.index({ createdAt: 1 });

export type SlideDocument = InferSchemaType<typeof SlideSchema>;

export const Slide: Model<SlideDocument> =
  (models.Slide as Model<SlideDocument>) ?? model<SlideDocument>("Slide", SlideSchema);
