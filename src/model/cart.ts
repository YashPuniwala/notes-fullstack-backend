import mongoose, { Document } from "mongoose";
import { IProductDocument } from "./product"; // Import IProductDocument interface
import { IUserDocument } from "./user"; // Import IUserDocument interface

export interface ICartItem {
  product: IProductDocument; // Use IProductDocument interface
  name: string;
  quantity: number;
  amount: number;
  createdAt?: Date;
}

export interface ICart extends Document {
  user: IUserDocument["_id"]; // Use IUserDocument interface
  shippingInfo: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
    phoneNo: number;
  };
  items: ICartItem[];
  quantity: number;
  totalPrice: number;
  createdAt?: Date;
}

// Cart schema
const cartSchema = new mongoose.Schema<ICart>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shippingInfo: {
    type: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pinCode: { type: Number, required: true },
      phoneNo: { type: Number, required: true },
    },
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      amount: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Define and export Cart model
export const CartModel = mongoose.model<ICart>("Cart", cartSchema);
