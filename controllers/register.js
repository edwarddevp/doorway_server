const handleRegister = (db, bcrypt)=> (req,res) =>{
    const { email, password, name} = req.body;

    if(!email || !password || !name){
        return res.status(400).json('Formulario Llenado Incorrectamente')
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password,salt);

    db.transaction(trx => {
        trx.insert({
            password:hash,
            username: name,
            NombreCompleto: email
        })
        .into('users')
        .then(id=>{
            return trx('users')
            .where({id:id[0]})
            .then(user => {
                res.json(user[0].id)
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('No se ha podido registrar'))
}

module.exports ={
    handleRegister: handleRegister
}