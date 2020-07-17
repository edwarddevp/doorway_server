const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('cliente')
    .where({id:id})
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error getting cliente'));
}

const handleCreate = (db)=> (req,res) => {
    const { fecha, idCliente, productoIds} = req.body;

    if(!fecha || !idCliente || !productoIds){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            fecha,
            idCliente
        })
        .into('factura')
        .then(facturaId=>{
            console.log(facturaId)
            const facturaReporteParams = productoIds.map((productId)=>{
                return {idFactura:facturaId,idProducto:productId}
            })
            return trx('productoFactura')
            .insert(facturaReporteParams)
            .then(() => {
                res.json("Factura Realizada con exito")
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json("La factura no pudo ser procesada"))
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


module.exports = {
    handleGet,
    handleCreate,
    handleUpdate,
}