const express = require('express');
const auth = require('../middleware/auth')
const router = express.Router();
const Notification = require('../Models/notification');

router.post('/notificaiton', auth, async (req, res) => {
    const notificaiton = new Notification({
        ...req.body,
        user: req.user._id
    })

    try {
        await notificaiton.save;
        res.status(201).send(notificaiton);
    }
    catch (e) {
        res.status(400).send(e);
    }
})


router.get('/notification', async (req, res) => {
    try {
        const notificaitons = await Notification.find
        res.send(notificaitons)
    } catch (e) {
        res.status(500).send(err);
    }
})

router.get('/notification/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const notificaitons = await Notification.find({ notReceiverId: _id })
        res.send(notificaitons)
    } catch (e) {
        res.status(500).send(err);
    }
})

module.exports = router;
