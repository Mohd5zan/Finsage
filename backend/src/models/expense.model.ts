import mongoose, { Schema, Document } from "mongoose";

export type ExpenseCategory =
  | "software"
  | "travel"
  | "food"
  | "office"
  | "utilities"
  | "other";

export interface ExpenseDocument extends Document {
  userId: mongoose.Types.ObjectId;
  merchant: string;
  amountMinor: number;
  category: ExpenseCategory;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<ExpenseDocument>(
  {
    userId: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
},
    merchant: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    amountMinor: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "software",
        "travel",
        "food",
        "office",
        "utilities",
        "other",
      ],
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model<ExpenseDocument>(
  "Expense",
  expenseSchema
);