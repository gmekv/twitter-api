const mongoose = require('mongoose')

const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/twitter-api'

mongoose.connect(mongoUrl)
