const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Checkout schema
const checkoutSchema = new Schema(
  {
    orderNumber: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referring to User model
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }, // Referring to MenuItem model (change from 'Menu' to 'MenuItem')
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
    orderStatus: { type: String, default: 'Pending' } // Status defaults to 'Pending'
  },
  { collection: 'checkouts' } // Ensure it uses the 'checkouts' collection
);

// Export the Checkout model
module.exports = mongoose.model('Checkout', checkoutSchema);
