const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkoutSchema = new Schema({
  orderNumber: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
      {
          itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
          quantity: { type: Number, required: true }
      }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
      flatNo: { type: String, required: true },
      buildingNo: { type: String, required: true },
      buildingName: { type: String, required: true },
      nearby: { type: String, required: true },
      pincode: { type: String, required: true },
      phoneNo: { type: String, required: true }
  },
  orderStatus: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
      default: 'Pending'
  }
}, {
  collection: 'checkouts',
  timestamps: true
});


module.exports = mongoose.model('Checkout', checkoutSchema);
