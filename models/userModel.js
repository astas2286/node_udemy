const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { throws } = require('assert')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name!']
    },
    email: {
        type: String,
        required: [true, 'User must have an email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false // this option not alow client to see the password(write "+password" if you want it to be visible)
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the password'],
        validate: {
            //THIS ONLY WORKS ON 'CREATE' OR 'SAVE'!!!
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not hte same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

//comment code below if you importing the user data
userSchema.pre('save', async function (next) {
    // Only runs this function if password was actually modified while user is logged in
    if (!this.isModified('password')) return next()

    // hash the pass with cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    // Delete pass confirm field
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', async function (next) {
    // added this.isNew because this is used only for "forgot password" but not for creating new user
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000 // 1 sec is for token to be created
    next()
})
//comment code above if you importing the user data

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } }) // to show only active users
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedPasswordTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedPasswordTimestamp
    }
    // false means that password was not changed
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User