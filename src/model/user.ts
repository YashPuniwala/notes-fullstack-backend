import mongoose, { InferSchemaType, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

const userSchema = new mongoose.Schema<IUserDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: {
      // validator: (value: string) => validator.isEmail(value),
      validator: (value: string) => /\S+@\S+\.\S+/.test(value),
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

// userSchema.pre("save", async function (this: IUserDocument, next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Define instance methods
// userSchema.methods.getJWTToken = function (this: IUserDocument) {
//   return jwt.sign({ _id: this._id }, process.env.JWT_SECRET || "", {
//     expiresIn: "15d",
//   });
// };

// userSchema.methods.comparePassword = async function (
//   this: IUserDocument,
//   password: string
// ) {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.getResetToken = async function (this: IUserDocument) {
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.resetPasswordExpire = (Date.now() + 15 * 60 * 1000).toString();

//   return resetToken;
// };

type User = InferSchemaType<typeof userSchema>;

export default mongoose.model<User>("User", userSchema);
