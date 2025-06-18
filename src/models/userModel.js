import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function () {
        return this.isGoogleLoggedIn; // Only require email if not logging in via Google
      },
      default: "",
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleLoggedIn; // Only require password if not logging in via Google
      },
      default: "",
    },
    isGoogleLoggedIn: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isGoogleLoggedIn) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
