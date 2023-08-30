const express = require('express');
const cartsRoutes = require('../src/routes/carts.routes');
const productsRoutes = require('../src/routes/products.routes');
const viewsRoutes = require('../src/routes/views.routes');
const handlebars = require('express-handlebars');
const __dirname = require('.utils.js/');
const Server = require('socket.io');
const mongoose = reqired('mongoose');


const app = express();
const PORT = 8080; 

//Configuracion Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

//Configuracion de Acceso a la carpeta public
app.use(express.static(__dirname+'/public'));


//Configuracion del servidor para recibir JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Creamos los enrutadores
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/realTimePorducts', viewsRoutes);

app.get('*', function (req, res) {
    res.send({status: "error", description: `ruta ${req.url} no encontrada`})
});

const httpServer = app.listen(PORT, ()=>{
    console.log(`Funcionando en puerto ${PORT}`);
})

//Instanciamos Socket del lado del Server
const socketServer = new Server(httpServer);
socketServer.on('connection', socket =>{
    socket.on('mensaje1', data =>{
        console.log(data);
    })

    socket.broadcast.emit('mensaje2', "Producto Eliminado")

})



//-----------Chat-------------------
let messages = []
socketServer.on('connection', socket => {

    socket.on('message', data => {
        messages.push(data);
        socket.broadcast.emit('messageLogs', messages);
        socketServer.emit('messageLogs', messages);
    })

    socket.on('userConnected', data => {
        socket.broadcast.emit('userConnected', data.user);
    })

    // socket.disconnect()
    socket.on('closeChat', data => {
        if (data.close === 'close')
            socket.disconnect();
    })
})


//-----------------Declaramos la conexion con la DB
const DB = 'mongodb+srv://disagustinalopez:RtPszX4bFwr4t0VB@cluster0.mfqjqym.mongodb.net/ecommerce?retryWrites=true&w=majority'
const connectMongoDB = async()=>{
    try {
        await mongoose.connect(DB);
        console.log("Conectado con exito a MongoDB usando Mongoose");
    } catch(error) {
        console.error("No se pudo conectar a la BD usando Mongoose: " + error);
        process.exit();
    }
}
connectMongoDB();