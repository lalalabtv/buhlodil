const {Router} = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const User = require('../Models/User')
const {check, validationResult} =require('express-validator')

const router = Router()

router.post(
    '/login',
    [
        check('username', 'Введите корректное имя пользователя'),
        check('password', 'Введите корректный пароль')
    ],
    async (req, res) => {
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array(), message: 'Введенные данные некорректны'})
            }

            const {username, password} = req.body
            const user = await User.findOne({username})

            if(!user){
                res.status(400).json({message:'Неправильный логин/пароль'})
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch){
                return res.status(400).json({message: 'Неправильный логин/пароль'})
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            res.json({token , userId: user.id })

        }catch (e) {
            res.status(500).json({message:'Что-то пошло не так, попробуйте снова'})
        }
    }
)

router.post(
    '/register',
    [
        check('username', 'Введите корректное имя пользователя').exists,
        check('password', 'Введите корректный пароль').isLength({min:8})
    ],
    async (req, res) => {
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array(), message: 'Введенные данные некорректны'})
            }

            const {username, password} = req.body

            const candidate = await User.findOne({username})

            if(candidate){
                return res.status(400).json({message:'Пользователь с такими данными уже существует'})
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            const user = new User({username, password: hashedPassword})

            await user.save()

            res.status(201).json({message: 'Пользователь создан'})
        }catch (e) {
           res.status(200).json({message: 'Ошибка при регистрации'})
        }
    }
)


module.exports = router
