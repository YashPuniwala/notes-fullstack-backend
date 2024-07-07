import mongoose, { Document } from "mongoose";

export interface Subcategory extends Document {
  name: string;
  subcategory?: string;
}

export interface Brand extends Document {
  name: string;
  brand?: string;
}

// Category model
export interface Category extends Document {
  name: string;
  subcategories: Subcategory[];
  brands: Brand[];
}

// Product model
export interface IProductDocument extends Document {
  title: string;
  description: string;
  images: string[];
  price: number;
  category: Category["_id"][];
  subcategory: Subcategory["_id"][];
  brand: Brand["_id"][];
}

const subcategorySchema = new mongoose.Schema<Subcategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
    },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema<Brand>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
  }
});

// Category schema
const categorySchema = new mongoose.Schema<Category>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subcategories: [subcategorySchema],
    brands: [brandSchema]
  },
  { timestamps: true }
);

// Product schema
const productSchema = new mongoose.Schema<IProductDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: {
    type: [String], // Array of image URLs
    required: true,
  },
  price: { type: Number, required: true },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  subcategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }],
  brand: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
});

// Define and export models
export const SubcategoryModel = mongoose.model<Subcategory>(
  "Subcategory",
  subcategorySchema
);
export const BrandModel = mongoose.model<Brand>("Brand", brandSchema);
export const CategoryModel = mongoose.model<Category>(
  "Category",
  categorySchema
);
export const ProductModel = mongoose.model<IProductDocument>("Product", productSchema);
