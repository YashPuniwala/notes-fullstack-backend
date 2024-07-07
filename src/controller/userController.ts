import User from "../model/user";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET_KEY = "d9uasind83287fun723j9f83hf8nyviu2j89jfpopk90cw432f";
const JWT_REFRESH_KEY = "FDSK90FK0M8IM29823FN892N38F8923JN822";
const ACCESS_TOKEN_EXPIRATION = "5m"; // 2 minutes
const REFRESH_TOKEN_EXPIRATION = "40m"; // 5 minutes

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, role } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
  }

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({
    name,
    email,
    role,
    password: hashedPassword,
  });
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }

  return res.status(201).json({ message: user });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all field" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "User Doesn't Exist" });
  }

  // const isMatch = await user.comparePassword(password);
  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect Email or Password" });
  }

  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  res.cookie("accessToken", String(accessToken), {
    httpOnly: true,
      // secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    secure: process.env.NODE_ENV === "production", // Ensure secure flag for production
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
      // secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === "production", // Ensure secure flag for production
  });

  return res.status(200).json({ message: "Successfully logged in", user });
};

interface CustomRequest extends Request {
  id?: string; // Define the custom property userId
}

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  console.log(accessToken, "accessToken");
  try {
    if (!JWT_SECRET_KEY) {
      throw new Error("JWT secret is not defined");
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET_KEY as Secret) as {
      id: string;
    };
    req.id = decoded.id; // Assigning decoded id to req.id
    next();
  } catch (error: any) {
    console.error(error.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

interface CustomRequest extends Request {
  id?: string; // Define the custom property userId
}

export const getUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  const userId = req.id;

  let user;
  try {
    user = await User.findById(userId, "-password");

    if (!accessToken) {
      return res.status(400).json({ message: "Invalid Access Token" });
    }
  } catch (error: any) {
    return new Error(error);
  }

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

interface CustomRequest extends Request {
  id?: string; // Define the custom property userId
}
interface DecodedToken {
  id: string;
  // Add other properties if needed
}

export const refreshToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  console.log("Refresh Token:", refreshToken); // Add debugging statement
  console.log("Access Token in Refresh Token:", accessToken); // Add debugging statement

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token found" });
  }

  // Set the flag to indicate that refresh token generation is in progress
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_KEY as Secret) as {
    id: string;
  };

  const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  // if (!accessToken) {
  //   // If there's no access token, remove the refreshToken cookie
  //   res.clearCookie("refreshToken");
  //   console.log("Cleared refreshToken cookie");
  //   // refreshTokenInProgress = false; // Reset the flag
  //   return res.status(400).json({ message: "Access token is missing. Refresh token cookie cleared." });
  // }

  res.cookie("accessToken", newAccessToken, {
    path: "/",
    expires: new Date(Date.now() + 5 * 50 * 1000), // Expires in 10 minutes
    // Expires in 30 seconds
    httpOnly: true,
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ message: "Access token refreshed successfully" });

  // jwt.verify(refreshToken, JWT_REFRESH_KEY, (err: any, decoded) => {
  //   if (err) {
  //     console.error(err);
  //     return res.status(403).json({ message: "Invalid Refresh Token" });
  //   }

  //   const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET_KEY, {
  //     expiresIn: ACCESS_TOKEN_EXPIRATION,
  //   });

  //   res.cookie("accessToken", newAccessToken, {
  //     path: "/",
  //     expires: new Date(Date.now() + 5 * 50 * 1000), // Expires in 10 minutes
  //     // Expires in 30 seconds
  //     httpOnly: true,
  //     sameSite: "lax",
  //   });

  //   return res
  //     .status(200)
  //     .json({ message: "Access token refreshed successfully" });
  // });
};

export const adminOnly = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.id;

  if (!userId) return res.status(401).json({ message: "You are not logged In" });

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: "User Not Found" });
  }

  if (user?.role !== "admin") {
    return res.status(401).json({ message: "You are not Admin" });
  }

  next();
};
