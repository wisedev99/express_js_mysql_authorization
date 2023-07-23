require('dotenv').config();
const User = require('./Models/User')
const express = require('express');
const cookieParser = require('cookie-parser');

const bcrypt = require('bcryptjs');

const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cookieParser());

app.get('/posts', authenticatToken, async (req, res) => {
    // const user = await User.findOne({ where: { username: 'admin' } })
    res.send(req.user);
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ where: { username: username } })
    // console.log(await bcrypt.compare(password, user.password), 'saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    if (!user || !(await bcrypt.compare(password, user.password)))
        res.sendStatus(401).json({ message: 'Password or username is uncorect' });

    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    const accessToken = jwt.sign(payload, process.env.ACCSESS_TOKEN_SECRET, { expiresIn: 180 });
    res.cookie("access_token", accessToken).status(200).json({ message: "Logged in successfully 😊 👌" });
    // res.json({ accessToken: accessToken })
})


function authenticatToken(req, res, next) {
    const token = req.cookies.access_token;

    if (token == null) res.sendStatus(401);

    jwt.verify(token, process.env.ACCSESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err);
            return res.sendStatus(403);
        }
        console.error('JWT verification failed:', decoded);
        req.user = decoded
        next();
    });
}

app.listen(4000)
