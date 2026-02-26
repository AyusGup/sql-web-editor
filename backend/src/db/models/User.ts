import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser extends Document {
  username: string;
  passwordHash: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;

  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  } catch (error: any) {
    throw new Error(error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>("User", UserSchema);