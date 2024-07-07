import express from "express";
import {
  adminOnly,
  getUser,
  login,
  logout,
  refreshToken,
  register,
  verifyToken,
} from "../controller/userController";
import {
  createNote,
  deleteNotes,
  getAllNotes,
  updateNotes,
} from "../controller/noteController";
import {
  createBrands,
  createCategory,
  createSubcategories,
  deleteCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
} from "../controller/categoryController";
import {
  createProduct,
  getAllProducts,
  getCategoryProducts,
} from "../controller/productController";
import multipleUpload from "../auth/multer";
// import { addToCart } from "../controller/cartController";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user").get(verifyToken, getUser);
router.route("/logout").get(logout);
router.get("/refresh", refreshToken, verifyToken, getUser);

// Notes
router.post("/createNote", verifyToken, createNote);
router.get("/getNotes", verifyToken, getAllNotes);
router.put("/updateNote/:id", verifyToken, updateNotes);
router.delete("/deleteNote/:id", verifyToken, deleteNotes);

// Category
router.route("/createCategory").post(createCategory);
router.route("/getAllCategories").get(getAllCategories);
router.route("/getSingleCategory/:categoryId").get(getSingleCategory);
router.route("/updateCategory/:categoryId").put(updateCategory);
router.route("/deleteCategory/:categoryId").delete(deleteCategory);
router.route("/createSubcategory/:categoryId").post(createSubcategories);
router.route("/createBrand/:categoryId").post(createBrands);

// Product
router
  .route("/createProduct")
  .post(verifyToken, adminOnly, multipleUpload, createProduct);
router.route("/getAllProducts").get(getAllProducts);
router.route("/getCategoryProducts/:categoryId").get(getCategoryProducts);

//Cart
// router.route("/addToCart/:productId").post(addToCart);

export default router;
