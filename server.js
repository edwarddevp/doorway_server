//Lib imports
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt-nodejs")
const cors = require('cors');
const knex = require('knex');
const path = require('path')

//user manage
const register = require('./controllers/register');
const signin = require('./controllers/signin');

//client manage
const client = require('./controllers/cliente');

//producto manage
const producto = require('./controllers/producto');

//reporte manage
const reporte = require('./controllers/reporte');

//reporte factura
const factura = require('./controllers/factura');

const db = knex({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'doorway_bd'
  }
  });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res) => res.send('it is working'));

app.get('/test',(req,res) => {
  db.select('id', 'nombre', 'cedula','direccion','correo')
  .from('cliente')
  .then(data=>res.json(data))
  

});

app.post('/signin', signin.handleSignin(db,bcrypt));

app.post('/register', register.handleRegister(db, bcrypt));

//cliente

app.get('/client-list', client.handleList(db));

app.get('/client-get/:id', client.handleGet(db));

app.post('/client-create', client.handleCreate(db));

app.post('/client-update', client.handleUpdate(db));

app.post('/client-remove', client.handleRemove(db));

//producto

app.get('/product-list', producto.handleList(db));

app.get('/product-get/:id', producto.handleGet(db));

app.post('/product-create', producto.handleCreate(db));

app.post('/product-update', producto.handleUpdate(db));

app.post('/product-remove', producto.handleRemove(db));

//reporte

app.post('/report-export', reporte.handleExport(db,path));

app.post('/report-list', reporte.handleList(db,path));

//reporte

app.post('/factura-create', factura.handleCreate(db,path));

app.post('/factura-update', factura.handleUpdate(db,path));

app.get('/factura-get/:id', factura.handleGet(db,path));



app.listen( 3000, () => console.log('app is runnning on port '+ 3000));
