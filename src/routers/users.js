const express = require('express')
const User = require('../Models/user')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')

//Original Router
const router = new express.Router()

// Helpers

const upload = multer({})



//Endpoints

//Create new user

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (e) {
        // Handle duplicate key error (username or email already exists)
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern)[0]
            return res.status(400).send({
                error: `A user with this ${field} already exists. Please use a different ${field}.`
            })
        }

        // Handle validation errors
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message)
            return res.status(400).send({ error: errors.join(', ') })
        }

        // Generic error
        res.status(400).send({ error: 'Unable to create user. Please try again.' })
    }
})

// Fetch the users

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    }
    catch (e) {
        res.status(500).send(e)
    }
})



// Login USer Routers

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

// Delete User Router

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).send({ error: 'User not found' })
        }
        res.send(user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// Fetch a single user

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send({ error: 'User not found' })
        }
        res.send(user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// Post User Profile Image

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        req.user.avatarExists = true
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    console.log(error.message)
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        // The database query could fail, so it goes inside try
        const user = await User.findById(req.params.id)

        // Check if user exists and has an avatar
        if (!user || !user.avatar) {
            return res.status(404).send()
        }

        // Set the content type header
        res.set('Content-Type', 'image/jpg')

        // Send the avatar data
        res.send(user.avatar)
    } catch (e) {
        // Handle any errors that occurred
        res.status(404).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    req.user.avatarExists = false
    await req.user.save()
    res.send()
})


// Following

router.put('/users/:id/follow', auth, async (req, res) => {
    // Check if user is trying to follow themselves
    if (req.user._id.toString() === req.params.id) {
        return res.status(403).send({ error: 'You cannot follow yourself' })
    }

    try {
        // Find the user to be followed
        const userToFollow = await User.findById(req.params.id)

        // Check if the user exists
        if (!userToFollow) {
            return res.status(404).send({ error: 'User not found' })
        }

        // Check if already following by converting IDs to strings for comparison
        if (userToFollow.followers.some(id => id.toString() === req.user._id.toString())) {
            return res.status(400).send({ error: 'You are already following this user' })
        }

        // Update both users - add follower and following relationships
        await User.findByIdAndUpdate(userToFollow._id, {
            $push: { followers: req.user._id }
        })

        await User.findByIdAndUpdate(req.user._id, {
            $push: { following: userToFollow._id }
        })

        // Fetch the updated current user to send back
        const updatedUser = await User.findById(req.user._id)

        res.status(200).send(updatedUser)
    } catch (e) {
        // Handle MongoDB CastError for invalid ObjectId
        if (e.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid user ID format' })
        }
        res.status(500).send({ error: 'Something went wrong' })
    }
})

// unfollow

router.put('/users/:id/unfollow', auth, async (req, res) => {
    // Check if user is trying to unfollow themselves
    if (req.user._id.toString() === req.params.id) {
        return res.status(403).send({ error: 'You cannot unfollow yourself' })
    }

    try {
        // Find the user to be unfollowed
        const userToUnfollow = await User.findById(req.params.id)

        // Check if the user exists
        if (!userToUnfollow) {
            return res.status(404).send({ error: 'User not found' })
        }

        // Check if already following by converting IDs to strings for comparison
        if (!userToUnfollow.followers.some(id => id.toString() === req.user._id.toString())) {
            return res.status(400).send({ error: 'You are not following this user' })
        }

        // Update both users - remove follower and following relationships
        await User.findByIdAndUpdate(userToUnfollow._id, {
            $pull: { followers: req.user._id }
        })

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { following: userToUnfollow._id }
        })

        // Fetch the updated current user to send back
        const updatedUser = await User.findById(req.user._id)

        res.status(200).send(updatedUser)
    } catch (e) {
        // Handle MongoDB CastError for invalid ObjectId
        if (e.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid user ID format' })
        }
        res.status(500).send({ error: 'Something went wrong' })
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'website', 'bio', 'location']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).send()
        }
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})



// Get User Profile Image

module.exports = router