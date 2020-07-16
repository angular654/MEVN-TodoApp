const Todo = require('../models/Todo')
const User = require('../models/User')
const File = require('../models/File')
const sender = require('../modules/mailer')
const emailValidator = require('email-validator')
const passValidator = require('password-validator')
const schema = new passValidator()
var creator = ''
var isSignUp = false
var upload = require('../modules/file-upload');

module.exports.home = async (req, res) => {
    const todos = (await Todo.find({ author: creator }).lean()).reverse()
    res.render('index', {
        title: 'List',
        todos,
        isSignUp: isSignUp
    })
}
module.exports.createPage = (req, res) => {
    res.render('create', {
        title: 'Create todo',
        isCreate: true,
        isSignUp: isSignUp
    })
}
module.exports.authPage = (req, res) => {
    res.render('auth', {
        title: 'Sign Up',
        isAuth: true,
        isSignUp: isSignUp
    })
}
module.exports.signinPage = (req, res) => {
    res.render('signin', {
        title: 'Sign In',
        isSignin: true,
        isSignUp: isSignUp
    })
}
module.exports.filesPage = (req, res) => {
    res.render('files', {
        title: 'Files',
        isUpload: true,
        isSignUp: isSignUp
    })
}
module.exports.createTodo = async (req, res) => {
    const todo = new Todo({
        title: req.body.title,
        content: req.body.content,
        author: creator,
        completeTime: req.body.time,
        createdAt: Date.now()
    })
    try {
        await todo.save()
        res.redirect('/')
    }
    catch (e) {
        console.log(`Ошибка при отправке Todo: ${e}`)
        res.redirect('/create')
    }
}
module.exports.completeTodo = async (req, res) => {
    const todo = await Todo.findById(req.body.id)
    todo.process = req.body.process
    todo.completed = !!req.body.completed
    if (todo.completed === true) {
        todo.process = 100
    }
    if (todo.process === 100) {
        todo.completed = true
    }
    await todo.save()
    res.redirect('/')
}
module.exports.deleteTodo = async (req, res) => {
    const todo = await Todo.findById(req.body.id)
    await todo.remove()
    res.redirect('/')
}
module.exports.authUser = async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    })
    if (schema.validate(user.password) === emailValidator.validate(user.email) && user.username.length >= 4) {
        try {
            await user.save()
            sender(user.email, "Вы успешно зарегистрировались")
            isSignUp = true
            creator = user.username
            res.redirect('/create')
        }
        catch (e) {
            res.status(404).send(`<h1>Страница не найдена :(</h1>`)
        }
    }
    else {
        console.log('Неверные данные')
        res.redirect('/auth')
    }
}
module.exports.signoutUser = async (req, res) => {
    await User.findByIdAndRemove(req.body.email, function (err) {
        if (err) res.send(err);
    })
    isSignUp = false
    res.redirect('/auth');
}
module.exports.signinUser = (req, res) => {
    User.findOne({ username: req.body.username, password: req.body.password })
        .exec((err, user) => {
            if (err) {
                console.warn(err);
            } else if (!user) {
                console.log('Пользователь не найден');
                return res.redirect('/signin');
            }
            creator = req.body.username
            isSignUp = true
            res.redirect('/');
        })

}
module.exports.fileUpload = (req, res) => {
    try {
        console.log(req.body.caption)
        res.redirect('/create')
    } catch(e){
         console.log(e)
    }
}