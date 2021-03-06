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
            email: email
        }, ['id'])
        .into('users')
        .then(id=>{
            return res.json(id)
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)})
}

module.exports ={
    handleRegister: handleRegister
}