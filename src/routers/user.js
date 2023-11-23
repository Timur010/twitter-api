const express = require('express');
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth')


const router = new express.Router();

//helpers 

const upload = multer({
    limits: {
        fieldSize: 100000000
    }
})

// creat a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } 
    catch (e) {
        res.status(400).send(e)
    }
})
// fetch the users 

router.get('/users', async(req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// login user routers

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }
    catch(e) {
        res.status(500).send(e)
    }
})

// search users by name
router.get('/user/search', async (req, res) => {
    try {
        const name = req.query.name
        const users = await User.find({name: {$regex: name, $options: 'i' }})
        res.send(users)
    }
    catch(e) {
        res.status(500).send(e)
    }
} )


// delete User Route

router.delete('/user/:id', async (req, res) => {
    try {
        const user = await  User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(400).send()
        }
        
        res.send()
    }
    catch(e) {
        res.status(500).send(e)
    }
    
})

// featch a single user

router.get('/user/:id', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }
        
        res.send(user)

    }
    catch(e) {
        res.status(500).send(e)
    }
})

//Post User Profile imge

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    if (req.user.avatar != null) {
        req.user.avatar = null
        req.user.avatarExists = false
    }

    req.user.avatar = buffer
    req.user.avatarExists = true
    await req.user.save()

    res.send(buffer)
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

module.exports = router