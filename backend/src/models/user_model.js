const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, 'Email required'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          'Please fill a valid email address'
        ],
      },
      name: {
        type: String,
        required: [true, 'Name is required'],
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be of atleast 8 characters'],
        select: false,
      },
      systemUser:
          {type: Boolean, default: false, immutable: true, select: false},
      otp_login: {
        otp_hash: {
          type: String,
        },
        expires_at: {
          type: Date,
        },
        is_used: {
          type: Boolean,
          default: false,
        }
      },
      is_verified: {
        type: Boolean,
        default: false,
      }
    },

    {timestamps: true});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;