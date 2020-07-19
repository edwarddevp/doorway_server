const handleList = (db)=> (req,res) => {
    db('ordencompra')
    .select('ordencompra.id','ordencompra.fechaCreacion','ordencompra.fechaEntrega','ordencompra.cantidad','producto.nombre as producto')
    .innerJoin('producto','ordencompra.idProducto','producto.id')
    .then(data=> res.json(data))
    .catch(err=>res.status(400).json(err));
}


const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('ordencompra')
    .where({id:id})
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error al traer la orden de compra'));
}

const handleCreate = (db)=> (req,res) => {
    const { fechaEntrega, cantidad, idProducto} = req.body;

    if(!fechaEntrega || !cantidad || !idProducto){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            fechaEntrega,
            cantidad,
            idProducto
        })
        .into('ordencompra')
        .then(id=>{
            return trx('ordencompra')
            .where({id:id[0]})
            .then(ordencompra => {
                res.json('Orden Creada con exito')
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido registrar el ordencompra'))
}


const handleUpdate = (db)=> (req,res) => {
    const {id, nombre, cedula, direccion, correo} = req.body;

    if(!id){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx('ordencompra')
        .where({id:id})
        .update({
            nombre,
            cedula,
            direccion,
            correo
        })
        .then(()=>{
            return trx('ordencompra')
            .where({id})
            .then(ordencompra => {
                res.json('Datos del ordencompra actualizados')
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
        .then(()=>res.json('orden compra eliminado con exito'))
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido eliminar el orden compra'))
}


module.exports = {
    handleList,
    handleGet,
    handleCreate,
    handleUpdate,
    handleRemove
}