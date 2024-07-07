import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../model/product";
import { v2 as cloudinary } from "cloudinary";
import singleUpload from "../auth/multer";
import dataUri from "../auth/dataUri";

cloudinary.config({
  cloud_name: "dxyada0yb",
  api_key: "778782275825219",
  api_secret: "5LcU32PYfbdo7K7c4s_kovYmvZw",
});

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validateIds = (ids: string | string[]) => {
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
    };

    const { brand, subcategory, category, color, ...productData } =
      req.body;

    console.log(validateIds, "validateIds");

    if (!validateIds(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID(s)" });
    }
    console.log(category, "category");
    if (!validateIds(brand)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid brand ID(s)" });
    }
    console.log(brand, "brand");

    if (!validateIds(subcategory)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subcategory ID(s)" });
    }
    console.log(subcategory, "subcategory");

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];
    const fileUris = dataUri(files);  

    // Upload files to Cloudinary
    const uploadPromises = fileUris.map(fileUri => {
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload(
          fileUri.content,
          { folder: "Notes-Fullstack" },
          (error: any, result: any) => {
            if (error) {
              console.error("Error uploading file to Cloudinary:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
  
    // Create product with uploaded image URLs
    const newProduct = await ProductModel.create({
      ...productData,
      images: uploadedImages,
      brand: Array.isArray(brand) ? brand : [brand],
      subcategory: Array.isArray(subcategory) ? subcategory : [subcategory],
      category: Array.isArray(category) ? category : [category],
    });

    res.json(newProduct);

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).send("Failed");
  }
};

// export const getAllProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { category, subcategory, brand, sort, priceMin, priceMax, search } =
//       req.query;

//     const query: any = {};

//     // Check and add filters to the query object
//     const addFilter = (field: string) => {
//       if (req.query[field]) {
//         if (!mongoose.Types.ObjectId.isValid(req.query[field] as string)) {
//           throw new Error(`Invalid ${field} ID`);
//         }
//         query[field] = req.query[field];
//       }
//     };

//     // Add filters for each field
//     ["category", "subcategory", "brand"].forEach((field) => addFilter(field));

//     // Add price filter
//     if (priceMin && priceMax) {
//       query.price = {
//         $gte: parseFloat(priceMin as string),
//         $lte: parseFloat(priceMax as string),
//       };
//     } else if (priceMin) {
//       query.price = { $gte: parseFloat(priceMin as string) };
//     } else if (priceMax) {
//       query.price = { $lte: parseFloat(priceMax as string) };
//     }

//     // Add search filter
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } }, // Case-insensitive search for product name
//         { description: { $regex: search, $options: 'i' } }, // Case-insensitive search for description
//       ];
//     }

//     let sortQuery: any = {};

//     // Determine sort options
//     if (sort) {
//       switch (sort) {
//         case "newest":
//           sortQuery = { _id: -1 }; // Sorting by newest based on _id field
//           break;
//         case "oldest":
//           sortQuery = { _id: 1 }; // Sorting by oldest based on _id field
//           break;
//         case "az":
//           sortQuery = { title: 1 }; // Sorting alphabetically ascending based on title field
//           break;
//         case "za":
//           sortQuery = { title: -1 }; // Sorting alphabetically descending based on title field
//           break;
//         default:
//           break;
//       }
//     }
//     // Find products based on the query and sort
//     const products = await ProductModel.find(query)
//       .sort(sortQuery)
//       .populate("category subcategory brand");

//     console.log("Sort parameter:", sort);
//     console.log("Sort query:", sortQuery);

//     res.status(200).json({ success: true, products });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      category,
      subcategory,
      brand,
      sort,
      price,
      search,
      priceMin,
      priceMax,
    } = req.query;

    const query: any = {};

    // Check and add filters to the query object
    const addFilter = (field: string) => {
      if (req.query[field]) {
        if (!mongoose.Types.ObjectId.isValid(req.query[field] as string)) {
          throw new Error(`Invalid ${field} ID`);
        }
        query[field] = req.query[field];
      }
    };

    // Add filters for each field
    ["category", "subcategory", "brand"].forEach((field) => addFilter(field));

    // Add price filter

    if (priceMin && priceMax) {
      query.price = {
        $gte: parseFloat(priceMin as string),
        $lte: parseFloat(priceMax as string),
      };
    } else if (priceMin) {
      query.price = { $gte: parseFloat(priceMin as string) };
    } else if (priceMax) {
      query.price = { $lte: parseFloat(priceMax as string) };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // Case-insensitive search for product name
        { description: { $regex: search, $options: "i" } }, // Case-insensitive search for description
      ];
    }

    let sortQuery: any = {};

    // Determine sort options
    if (sort) {
      switch (sort) {
        case "newest":
          sortQuery = { _id: -1 }; // Sorting by newest based on _id field
          break;
        case "oldest":
          sortQuery = { _id: 1 }; // Sorting by oldest based on _id field
          break;
        case "az":
          sortQuery = { title: 1 }; // Sorting alphabetically ascending based on title field
          break;
        case "za":
          sortQuery = { title: -1 }; // Sorting alphabetically descending based on title field
          break;
        case "low":
          sortQuery = { price: 1 }; // Sorting by price low to high
          break;
        case "high":
          sortQuery = { price: -1 }; // Sorting by price high to low
          break;
        default:
          break;
      }
    }
    // Find products based on the query and sort
    const products = await ProductModel.find(query)
      .sort(sortQuery)
      .populate("category subcategory brand");

    console.log("Sort parameter:", sort);
    console.log("Sort query:", sortQuery);

    res.status(200).json({ success: true, products });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

interface CategoryProductsParams {
  categoryId: string;
}

export const getCategoryProducts = async (
  req: Request<CategoryProductsParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const products = await ProductModel.find({ category: categoryId });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
