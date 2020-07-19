const handleGet = (db)=> (req,res) => {
    const { id } = req.params;
    db('cliente')
    .where({id:id})
    .then(data=> res.json(data[0]))
    .catch(err=>res.status(400).json('error getting cliente'));
}

const handleCreate = (db)=> (req,res) => {
    const {  idCliente, productoIds} = req.body;
    const fecha = new Date()
    if(!idCliente || !productoIds){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx.insert({
            fecha,
            idCliente
        })
        .into('factura')
        .then(facturaId=>{
            const facturaReporteParams = productoIds.map((productId)=>{
                return {idFactura:facturaId,idProducto:productId}
            })
            return trx('productoFactura')
            .insert(facturaReporteParams)
            .then(() => {
                res.json("Factura Realizada con exito")
                const productsIds = facturaReporteParams.map(item=>item.idProducto)
                return trx('producto')
                    .select()
                    .whereIn('id', productsIds)
                    .then(result=>{
                        result.map(item=>{
                            db('producto')
                            .where({id:item.id})
                            .update({
                                cantidad: item.cantidad - 1,
                            })
                            .then(result=>null)
                            .catch(err=>console.log(err))
                        })
                    })
                    .catch(err=>console.log(err))
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