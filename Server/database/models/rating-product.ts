import mongoose, { Schema } from 'mongoose'
const RatingProductSchema = new Schema(
  {
    user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
    product_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'products' },
    comment: { type: String },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
)

export const RatingProductModel = mongoose.model(
  'rating_products',
  RatingProductSchema
)
