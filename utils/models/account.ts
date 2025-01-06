import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  codeBank: {
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
  idMattermost: {
    type: String,
    required: false,
  },
});
const Account =
  mongoose.models.account || mongoose.model('account', accountSchema);

export default Account;
