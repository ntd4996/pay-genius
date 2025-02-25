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
  mention: {
    type: String,
    default: '',
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
    default: '',
  },
}, {
  timestamps: true,
  collection: 'accounts'
});
const Account =
  mongoose.models.account || mongoose.model('account', accountSchema);

export default Account;
