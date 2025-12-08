const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    avatar: {
        type: Buffer
    },
    avatarExists: {
        type: Boolean,
    },
    bio: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
}, {
    timestamps: true
})

userSchema.virtual('tweets', {
    ref: 'Tweet',
    localField: '_id',
    foreignField: 'userID'
})

userSchema.virtual('notificationSent', {
    ref: 'Notification',
    localField: '_id',
    foreignField: 'notSenderId'
})

userSchema.virtual('notificationReceived', {
    ref: 'Notification',
    localField: '_id',
    foreignField: 'notReceiverId'
})



// To Delete Password prior to Get

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens      // Hide all auth tokens
    delete userObject.avatar      // Hide binary avatar data
    return userObject
}

// To Hash the password

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// AUhtentication check 
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

const User = mongoose.model('User', userSchema)
module.exports = User