const express = require('express');
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const Tweet = require('../models/tweet');


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
        const name = req.query.name;
        const current = req.query.current;
        const category = req.query.category;
        const sortOrder = req.query.sortOrder 

        let query = { text: { $regex: name, $options: 'i' } };

        if (current === 'User') {
            const users = await User.find(query);
            res.send(users);
        } else if (current === 'Posts') {
            if (category) {
                query.category = category; // Добавляем фильтрацию по категории, если параметр category передан
            }

            const posts = await Tweet.find(query).sort({createdAt: sortOrder });
            res.send(posts);
        } else {
            res.status(400).send("Invalid value for 'current' parameter.");
        }
    } catch (e) {
        res.status(500).send(e);
    }
});


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

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('The user doesnt exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }
    catch(e) {
        res.status(400).send(e)
    }
})

router.put('/users/:id/follow', auth, async (req, res) => {
    if (req.user.id != req.params.id) {
        try {
            const user = await User.findById(req.params.id)

            if (!user.followers.includes(req.user.id)) {
                await user.updateOne({ $push: {followers: req.user.id} })
                await user.updateOne({ $push: {followings: req.params.id} })
                res.status(200).json("User has been followed")
            } else {
                res.status(403).json("вы уже подписаны на пользователя")
            }
        }
        catch(e) {
            res.status(500).json(e)
        } 
    }
    else {
        res.status(403).json('вы не можете подписатся на самого себя')
    }
})

router.put('/users/:id/unfolow', auth, async (req, res) => {
    if  (req.user.id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)

            if (user.followers.includes(req.user.id)) {
                await user.updateOne({ $pull: {followers: req.user.id} })
                await req.user.updateOne({ $pull: {followings: req.params.id} })
                res.status(200).json('вы отписались от пользователя')
            }
            else {
                res.status(403).json('вы не подписаны на этого пользователя')
            }
        } 
        catch (e) {
            res.status(500).json(e)
        }
    }
    else {
        res.status(403).json('вы не можете отписатся от себя')
    }
})
module.exports = router