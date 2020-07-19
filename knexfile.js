module.exports =  {
    client: 'mysql',
    connection: {
      connectionString : process.env.DATABASE_URL,
      ssl:true
    },
    
  }