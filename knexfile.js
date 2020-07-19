module.exports =  {
    client: 'pg',
    connection: {
      connectionString : process.env.DATABASE_URL,
      ssl:true
    },
    
  }