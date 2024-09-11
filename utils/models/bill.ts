import { Schema, model, Model, models } from 'mongoose';

const billSchema = new Schema({
  uid: {
    type: Number,
    required: true,
    unique: true,
  },
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
  status: {
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
  idPost: {
    type: String,
    required: false,
  },
});

billSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const lastBill = await (this.constructor as Model<any>)
      .findOne()
      .sort({ uid: -1 });
    this.uid = lastBill && lastBill.uid ? lastBill.uid + 1 : 1;
  }
  next();
});

const Bill = models.Bill || model('Bill', billSchema);

export default Bill;
