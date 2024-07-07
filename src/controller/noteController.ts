import { Request, Response, NextFunction } from "express";
import User from "../model/user";
import Note from "../model/note";

interface CustomRequest extends Request {
  id?: string; // Define the custom property userId
}

export const createNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content } = req.body;
    const userId = req.id;

    if (!title || !content) {
      res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    console.log(user, "user");
    const note = new Note({
      title,
      content,
      user: user?._id,
    });

    await note.save();
    return res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    console.log("Error createing note", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllNotes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const notes = await Note.find({ user: userId });
    return res.status(200).json({ notes });
  } catch (error) {
    console.log("Error createing note", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateNotes = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params; // Assuming note id is passed in the URL params
    const userId  = req.id; // Assuming userId is passed in the URL params

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
     
      console.log(note, "note")
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json({ message: "Note updated successfully", note });
  } catch (error) {
    console.log("Error updating note", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotes = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId  = req.id; // Assuming userId is passed in the URL params
    const { id } = req.params; // Assuming note id is passed in the URL params

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const note = await Note.findOneAndDelete({ _id: id, user: userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json({ message: "Note deleted successfully", note });
  } catch (error) {
    console.log("Error deleting note", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
