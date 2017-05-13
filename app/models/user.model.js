/**
 * Created by alex on 5/10/17.
 */

'use strict';

const modelName = 'User';
const crypto = require('crypto');

module.exports = function (mongoose) {
  let Schema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    hashedPassword: {
      type: String,
      default: '',
      required: true
    },
    salt: {
      type: String
    },
    updatedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    /* For reset password */
    phoneNumber: {
      type: String,
      validate: {
        validator(string) {
          return /\+\d{11}/.test(string);
        },
        message: '{VALUE} is not a valid phone number!'
      },
      required: true
    },
    verificationCode: {
      type: String,
      allowNull: true,
    },
  });

  /**
   * Create instance method for hashing a password
   */
  Schema.methods.hashPassword = function (password) {
    if (this.salt && password) {
      return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
      return password;
    }
  };

  /**
   * Create instance method for authenticating user
   */
  Schema.methods.authenticate = function (password) {
    return this.hashedPassword === this.hashPassword(password);
  };

  Schema.virtual('password')
    .set(function(password) {
      this._plainPassword = password;
      this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
      this.hashedPassword = this.hashPassword(password);
    })
    .get(function() {
      return this._plainPassword;
    });

  return mongoose.model(modelName, Schema);
};
