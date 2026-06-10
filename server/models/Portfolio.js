const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    buyPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    buyDate: { type: Date, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

portfolioSchema.virtual('currentValue').get(function currentValue() {
  return this.quantity * (this.currentPrice || this.buyPrice || 0);
});

portfolioSchema.virtual('profitLoss').get(function profitLoss() {
  return this.currentValue - this.quantity * this.buyPrice;
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
