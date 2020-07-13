//Lib imports
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt-nodejs")
const cors = require('cors');
const knex = require('knex');

//user manage
const register = require('./controllers/register');
const signin = require('./controllers/signin');

//client manage
const client = require('./controllers/cliente');

//producto manage
const producto = require('./controllers/producto');

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

app.get('/producto-list', producto.handleList(db));

app.get('/producto-get/:id', producto.handleGet(db));

app.post('/producto-create', producto.handleCreate(db));

app.post('/producto-update', producto.handleUpdate(db));

app.post('/producto-remove', producto.handleRemove(db));



app.listen( 3000, () => console.log('app is runnning on port '+ 3000));
