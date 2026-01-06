require('dotenv').config()
const express = require('express')
require('../db/mongoose')
const notificationRouter = require('./routers/notification')
const userRouter = require('./routers/users')
const tweetRouter = require('./routers/tweet')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(tweetRouter)
app.use(notificationRouter);

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log('Server is up on the port ' + port)
})
