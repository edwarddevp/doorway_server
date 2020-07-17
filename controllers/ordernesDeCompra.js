const handleList = (db)=> (req,res) => {
    db('ordencompra')
    .then(data=> res.json(data))
    .catch(err=>res.status(400).json(err));
}


const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('ordencompra')
    .where({id:id})
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error getting ordencompra'));
}

const handleCreate = (db)=> (req,res) => {
    const { codigo, precio} = req.body;

    if(!codigo || !precio){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            codigo,
            precio
        })
        .into('ordencompra')
        .then(id=>{
            return trx('ordencompra')
            .where({id:id[0]})
            .then(ordencompra => {
                res.json(ordencompra[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
}


const handleUpdate = (db)=> (req,res) => {
    const {id, codigo, precio} = req.body;

    if(!id){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }
    db.transaction(trx => {
        trx('ordencompra')
        .where({id:id})
        .update({
            codigo,
            precio
        })
        .then(()=>{
            return trx('ordencompra')
            .where({id})
            .then(ordencompra => {
                res.json(ordencompra[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido actualizar el ordencompra'))
}

const handleRemove = (db)=> (req,res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json('No se ha recibido campo id')
    }

    db.transaction(trx => {
        trx('ordencompra')
        .where({id:id})
        .del()
        .then(()=>res.json('ordencompra eliminado con exito'))
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido eliminar el ordencompra'))
}


module.exports = {
    handleList,
    handleGet,
    handleCreate,
    handleUpdate,
    handleRemove
}