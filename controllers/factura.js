const handleList = (db)=> (req,res) => {
    const regex = /-/gi;
    db.transaction(trx => {
      trx.from('factura')
        .select('factura.id as id',
          'factura.fecha as fecha',
          'cliente.nombre as nombreCliente',
          'cliente.cedula as cedulaCliente',
          'cliente.correo as correoCliente',
          trx.raw('GROUP_CONCAT(producto.nombre) as productosNombres, GROUP_CONCAT(producto.precio) as productosPrecios')
          )
        .innerJoin(
          'cliente',
          'cliente.id',
          'factura.idCliente'
        ).innerJoin(
          'productofactura',
          'productofactura.idFactura',
          'factura.id'
        ).innerJoin(
          'producto',
          'productofactura.idProducto',
          'producto.id'
        )
        .andWhere('factura.isRemoved', 0)
        .groupBy('id')
        .then(result => {
              res.json(result)
          })
          .then(trx.commit)
          .catch(trx.rollback)
        })
      .catch(err => res.status(400).json(err))
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


const handleRemove = (db)=> (req,res) => {
    const {id, nombre, cedula, direccion, correo} = req.body;

    if(!id){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    db.transaction(trx => {
        trx('factura')
        .where({id:id})
        .update({isRemoved:1})
        .then(idResult=>{
                res.json("Factura anulada con exito")
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido actualizar el cliente'))
}


module.exports = {
    handleList,
    handleCreate,
    handleRemove,
}