const handleList = (db)=> (req,res) => {
    db('cliente')
    .then(data=> res.json(data))
    .catch(err=>res.status(400).json(err));
}


const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('cliente')
    .where({id:id})
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error getting cliente'));
}

const handleCreate = (db)=> (req,res) => {
    const { nombre, cedula, direccion, correo} = req.body;

    if(!nombre || !cedula || !direccion || !correo){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            nombre,
            cedula,
            direccion,
            correo
        })
        .into('cliente')
        .then(id=>{
            return trx('cliente')
            .where({id:id[0]})
            .then(user => {
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido registrar el cliente'))
}


const handleUpdate = (db)=> (req,res) => {
    const {id, nombre, cedula, direccion, correo} = req.body;

    if(!id){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx('cliente')
        .where({id:id})
        .update({
            nombre,
            cedula,
            direccion,
            correo
        })
        .then(idResult=>{
            return trx('cliente')
            .where({id:idResult})
            .then(user => {
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido actualizar el cliente'))
}

const handleRemove = (db)=> (req,res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json('No se ha recibido campo id')
    }

    db.transaction(trx => {
        trx('cliente')
        .where({id:id})
        .del()
        .then(()=>res.json('cliente eliminado con exito'))
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido eliminar el cliente'))
}


module.exports = {
    handleList,
    handleGet,
    handleCreate,
    handleUpdate,
    handleRemove
}