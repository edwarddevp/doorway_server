const handleSignin = (db,bcrypt)=> (req,res) => {

    const { email, password } = req.body;

    if(!email || !password ){
        return res.status(400).json('Incorrect form submission')
    }

    db('users')
    .where('NombreCompleto','=',email)
    .then(data=>{
        if(data.length > 0){
        const isValid = bcrypt.compareSync(password, data[0].password)
    
        if(isValid){
            res.json(data[0])
        }else{
            res.status(400).json('Contraseña equivocada')
        }
    }else{
        res.status(400).json('No hay ningun usuario registrado con ese email')
    }

    })
    .catch(err=>res.status(400).json('Datos equivocados'));

}

module.exports = {
    handleSignin:handleSignin
}