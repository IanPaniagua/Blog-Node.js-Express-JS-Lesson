const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



//Check Login Middleware
const authMiddLeware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized'});
        //you can render a message or another page
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userIde = decoded.userId;
        next();
    }catch(error) {
        return res.status(401).json({ message: 'Unauthorized'});
        
    }
}







//GET
//Admin-login-page
router.get('/admin', async (req, res) => {

    try{
    const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJS, Express & MongoDb."
    }
    res.render('admin/index', {locals, layout: adminLayout});

    }catch(error){
        console.log(error);
    }
});


//POST
//Admin-Check- Login
router.post('/admin', async (req, res) => {

    try{
        const {username, password} = req.body;

        const user = await User.findOne( { username } );

        if(!user) {
            return res.status(401).json( { message: 'Invalid credentials' } );
        }

        const isPassworvalid = await bcrypt.compare(password, user.password);
        if(!isPassworvalid) {
            return res.status(401).json( { message: 'Invalid credentials' } );
        }

        //sent jtw cookie secret
        const token = jwt.sign({ userId: user._id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
});

//GET
//Admin Dashboard
router.get('/dashboard', authMiddLeware, async (req, res) => {

    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJS, Express & MongoDb."
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals, 
            data,
            layout: adminLayout
        });

    }catch(error) {
        console.log(error)
    }

});

//GET
//Admin Dashboard - Create New Post
router.get('/add-post', authMiddLeware, async (req, res) => {

    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with NodeJS, Express & MongoDb."
        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });

    }catch(error) {
        console.log(error)
    }

});

//GET
//Admin Dashboard - Edit Post
router.get('/edit-post/:id', authMiddLeware, async (req, res) => {

    try {
        const locals = {
            title: "Edit Post",
            description: "Simple Blog created with NodeJS, Express & MongoDb."
        }

        const data = await Post.findOne({_id: req.params.id });

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        });

    }catch(error) {
        console.log(error)
    }

});

//POST
//Admin Dashboard - Create New Post
router.post('/add-post', authMiddLeware, async (req, res) => {

    try {
        // console.log(req.body); //optional

        try {
            const newPost = new Post ({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost)
            res.redirect('/dashboard');
        } catch(error){
            console.log(error)
        }

    } catch(error) {
        console.log(error)
    }

});

//POST
//Admin register
router.post('/register', async (req, res) => {

    try{
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            const user = await User.create({username, password:hashedPassword});
            res.status(201).json({message: 'User Created', user});
        }catch(error) {
            if(error.code === 11000) {
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({message: 'Internal server error'})
        }
    }catch(error){
        console.log(error);
    }
});

//PUT
//Admin Dashboard - Edit Post
router.put('/edit-post/:id', authMiddLeware, async (req, res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

    }catch(error) {
        console.log(error)
    }

});



//DEL
//Admin Dashboard - DELETE Post

router.delete('/delete-post/:id', authMiddLeware, async (req, res) => {

    try {
        await Post.deleteOne( { _id: req.params.id })
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

});


// GET
//Admin LOGOUT

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    // res.json({ message: 'Logout successful.'});
    res.redirect('/')
})



module.exports = router;