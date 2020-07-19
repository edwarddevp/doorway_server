const handleList = (db)=> (req,res) => {
    db('producto')
    .where('isremoved', 0)
    .then(data=> res.json(data))
    .catch(err=>res.status(400).json(err));
}


const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('producto')
    .where({id:id})
    .andWhere('isremoved', 0)
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error getting producto'));
}

const handleCreate = (db)=> (req,res) => {
    const { nombre, cantidad, descripcion,precio} = req.body;

    if(!nombre || !cantidad || !precio){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            nombre,
            cantidad,
            precio,
            descripcion
        })
        .into('producto')
        .returning('id')
        .then(id=>{
            return trx('producto')
            .where({id:id[0]})
            .then(producto => {
                res.json('Producto creado con exito')
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
}


const handleUpdate = (db)=> (req,res) => {
    const {id, nombre, cantidad, precio, descripcion} = req.body;

    if(!id){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }
    db.transaction(trx => {
        trx('producto')
        .where({id:id})
        .update({
            nombre,
            cantidad,
            precio,
            descripcion
        })
        .then(()=>{
            return trx('producto')
            .where({id})
            .then(producto => {
                res.json('Producto actualizado con exito')
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido actualizar el producto'))
}

const handleRemove = (db)=> (req,res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json('No se ha recibido campo id')
    }

    db.transaction(trx => {
        trx('producto')
        .where({id:id})
        .update({isremoved:1})
        .then(()=>res.json('producto eliminado con exito'))
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
}


module.exports = {
    handleList,
    handleGet,
    handleCreate,
    handleUpdate,
    handleRemove
}