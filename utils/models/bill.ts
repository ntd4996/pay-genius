import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  nameBill: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bank: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  shipping: {
    type: String,
    required: false,
  },
  amountDiscount: {
    type: String,
    required: false,
  },
  headerTable: {
    type: Array,
  },
  listTransferPerson: {
    type: Array,
  },
  createBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  deleteAt: {
    type: Date,
  },
});

const Bill = mongoose.models.bill || mongoose.model('bill', billSchema);

export default Bill;
