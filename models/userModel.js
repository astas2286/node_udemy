const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false // this option not alow client to see the password
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
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User