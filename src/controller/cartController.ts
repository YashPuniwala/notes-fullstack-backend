// import { NextFunction, Request, Response } from "express";
// import User from "../model/user";
// import { ProductModel } from "../model/product";
// import { CartModel, ICart } from "../model/cart";

// interface AddToCartRequestParams {
//   productId: string;
// }

// interface AddToCartRequest extends Request<AddToCartRequestParams> {
//   id?: string; // Assuming userId is optional and may be present in the request
// }

// export const addToCart = async (
//   req: AddToCartRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.id;

//     if (!userId) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     // Find the user
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Find the product
//     const product = await ProductModel.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Find or create the user's cart
//     let cart: ICart | null = await CartModel.findOne({ user: userId });

//     if (!cart) {
//       cart = new CartModel({
//         user: userId,
//         items: [],
//         quantity: 0,
//         totalPrice: 0,
//       });
//     }

//     // Check if the item already exists in the cart
//     const itemIndex = cart.items.findIndex(
//       (item) => item.product.toString() === productId
//     );

//     if (itemIndex !== -1) {
//       // If it does, increase the quantity
//       cart.items[itemIndex].quantity++;
//     } else {
//       // Otherwise, add a new item to the cart
//       cart.items.push({
//         product: productId,
//         name: product.name,
//         quantity: 1,
//         amount: product.price,
//       });
//     }

//     // Update the total quantity of the cart
//     cart.quantity++;

//     // Calculate subtotal and tax
//     const subtotal = cart.items.reduce(
//       (acc, item) => acc + item.quantity * item.amount,
//       0
//     );
//     const tax = Math.round(subtotal * 0.3 * 100) / 100;

//     // Check user's country and set shipping charges accordingly
//     const userCountry = user.shippingDetail?.country;
//     cart.shippingCharges = userCountry === "India" ? 20 : 100;

//     // Update the total price of the cart
//     cart.totalPrice = subtotal + tax + cart.shippingCharges;

//     // Save the cart
//     await cart.save();

//     // Response data
//     const response = {
//       cart,
//       totalPrice: cart.totalPrice,
//       subtotal,
//       tax,
//       shippingCharges: cart.shippingCharges,
//     };

//     res.json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
