import mongoose, { InferSchemaType } from "mongoose";
import User, { IUserDocument } from "./user.js";

export interface INoteDocument extends Document {
    title: string;
    content: string;
    user: IUserDocument['_id']; // Reference to the user
  }

// const Schema = mongoose.Schema;

const noteSchema = new mongoose.Schema<INoteDocument>({
    title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

type Note = InferSchemaType<typeof noteSchema>;

export default mongoose.model<Note>("Note", noteSchema);

