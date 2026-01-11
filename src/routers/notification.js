const express = require('express');
const auth = require('../middleware/auth')
const router = express.Router();
const Notification = require('../Models/notification');

// Create a notification
router.post('/notifications', auth, async (req, res) => {
    const notification = new Notification({
        ...req.body,
        notSenderId: req.user._id // Using the standardized field name from your model
    })

    try {
        await notification.save();
        res.status(201).send(notification);
    }
    catch (e) {
        res.status(400).send(e);
    }
})

// Fetch all notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({})
        res.send(notifications)
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

// Fetch notifications for a specific user
router.get('/notifications/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const notifications = await Notification.find({ notReceiverId: _id })
        res.send(notifications)
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = router;
