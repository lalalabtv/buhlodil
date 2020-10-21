const express = require('express')
const config = require('config')
const mongoose = require('mongoose')


const app = express()

app.use(express.json({extended:true}))
app.use('/api/auth', require('./src/Routes/Auth.routes'))

const PORT = config.get('port') || 5001

async function start(){
    try{
        await mongoose.connect(config.get('mongoUrl'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, ()=>{
            console.log(`Server has been started on port: ${PORT}`)
        })
    }catch (e) {
        console.log('Server crashed with error: ', e.message)
        process.exit(1)
    }
}

start()
