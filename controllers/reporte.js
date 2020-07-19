
const pdfMakePrinter = require('pdfmake/src/printer');

const docDefinition = (date,hours,initialDate, finalDate,result) => { 
  const dataTable = result.map(item=>{
    const nombreProductos = item.productosNombres.split(',')
    const precioProductos = item.productosPrecios.split(',')

    const regex = /,/gi;

    const today = new Date(item.fecha);
    const date = today.getFullYear() + '-' + (today.getMonth()) + '-' + today.getDate();
    return[
    item.id,
    date,
    item.nombreCliente,
    item.cedulaCliente,
    item.correoCliente,
    nombreProductos.map((nombre,index)=>nombre+' '+precioProductos[index]+'$\n').join().replace(regex,'')
  ]})
  return {
    pageMargins: [40, 60, 10, 60],
    footer: function(currentPage, pageCount) { return {text:currentPage.toString() + ' of ' + pageCount,alignment:'right', marginRight:30} },
    content: [
      {
        columns: [
          {
            // auto-sized columns have their widths based on their content
            width: '60%',
            text: 'Doorway, C.A.\nReporte De facturas', style: 'header',
          },
          {
            // % width
            width: '20%',
            text: '',
          },
          {
            // % width
            width: '20%',
            text: date + '\n' + hours,
          }
        ]
      },
      { text: '\n' },
      {
        columns: [
          {
            width: '35%',
            text: '',
          },
          {
            // % width
            width: '50%',
            text: 'Reporte De facturas realizadas'
          }
        ]
      },

      { text: '\nEmision: ' + initialDate + ' \n\n', fontSize: 10 },
      { text: 'Hasta: ' + finalDate + ' \n\n', fontSize: 10 },
      {
        layout: 'lightHorizontalLines', // optional
        table: {
          // headers are automatically repe ated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: [20, 70, 90, 90, 90,'*'],

          body: [
            [
              "id",
              "fecha",
              "Nombre Cliente",
              "Cedula Cliente",
              "Correo Cliente",
              "Productos",
            ],
            ...dataTable
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      bigger: {
        fontSize: 15,
        italics: true
      },
      left: {
        textAlign: 'left'
      }
    }
  }
}


const generatePdf = (docDefinition, callback) => {
  try {

    const fontDescriptors = {
      Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
      }
    }
    const printer = new pdfMakePrinter(fontDescriptors);
    const doc = printer.createPdfKitDocument(docDefinition);

    let chunks = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      callback('data:application/pdf;base64,' + result.toString('base64'));
    });

    doc.end();

  } catch (err) {
    throw (err);
  }
};

const handleList = (db) => (req, res) => {
  const { initialDate, finalDate } = req.body

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
      .whereBetween('factura.fecha', [initialDate.replace(regex,'/'), finalDate.replace(regex,'/')])
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

const handleExport = (db, path) => (req, res) => {
  const { initialDate, finalDate } = req.body

  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth()) + '-' + today.getDate();
  const hours = today.getHours() + ':' + (today.getHours()) + ':' + today.getSeconds();

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
      .whereBetween('factura.fecha', [initialDate.replace(regex,'/'), finalDate.replace(regex,'/')])
      .andWhere('factura.isRemoved', 0)
      .groupBy('id')
      .then(result => {
          const doc = docDefinition(date,hours,initialDate, finalDate,result)
          generatePdf(doc, (binary) => {
            res.contentType('application/pdf');
            res.json(binary);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))


}



module.exports = {
  handleList,
  handleExport
}