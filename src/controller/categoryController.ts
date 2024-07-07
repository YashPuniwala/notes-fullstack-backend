import { NextFunction, Request, Response } from "express";
import {
  BrandModel,
  // Category,
  CategoryModel,
  // Subcategory,
  SubcategoryModel,
} from "./../model/product";
// import {ICategory} from "./../model/product"
import slugify from "slugify";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract category details from request body
    const { name, subcategories } = req.body;

    // Check if category name already exists
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      res.status(400).json({ error: "Category with this name already exists" });
      return;
    }

    // Create a new category
    const newCategory = await CategoryModel.create({ name, subcategories });

    // Send success response
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await CategoryModel.find({}).sort({ createdAt: -1 }).exec());
  } catch (error) {
    console.log(error, "error");
  }
};

export const getSingleCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract category ID from request parameters
    const categoryId = req.params.categoryId;

    // Find the category by ID
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Send success response with the category
    res.status(200).json({ category });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

interface UpdateCategoryBody {
  name: string;
}

export const updateCategory = async (
  req: Request<{ categoryId: string }, {}, UpdateCategoryBody>,
  res: Response
): Promise<void> => {
  try {
    // Extract category ID from request parameters
    const categoryId = req.params.categoryId;

    // Extract updated category details from request body
    const { name } = req.body;

    // Find the category by ID and update it
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );

    // Check if category exists and updated successfully
    if (!updatedCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Send success response with the updated category
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    // Handle errors
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

interface DeleteCategoryParams {
  categoryId: string
}

export const deleteCategory = async (
  req: Request<DeleteCategoryParams>,
  res: Response
): Promise<void> => {
  try {
    // Extract category ID from request parameters
    const categoryId = req.params.categoryId;

    // Find the category by ID and update it
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);

    // Check if category exists and updated successfully
    res.status(200).json({
      message: "Category Deleted successfully",
      deletedCategory
    });
  } catch (error) {
    // Handle errors
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createSubcategories = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const categoryId: string = req.params.categoryId;

    // Check if the category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create a new subcategory
    const newSubcategory = new SubcategoryModel({ name, slug });

    // Save the new subcategory
    await newSubcategory.save();

    // Add the new subcategory to the category's subcategories array
    category.subcategories.push(newSubcategory);

    // Save the category
    await category.save();

    // Send a success response
    res.status(201).json({ message: "Subcategory created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBrands = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const categoryId: string = req.params.categoryId;

    // Check if the category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create a new subcategory
    const newBrand = new BrandModel({ name, slug });

    // Save the new subcategory
    await newBrand.save();

    // Add the new subcategory to the category's subcategories array
    category.brands.push(newBrand);

    // Save the category
    await category.save();

    // Send a success response
    res.status(201).json({ message: "Subcategory created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};