const bcrypt = require('bcryptjs');
const saltRounds = 12;
const minhaSenha = '123456';

bcrypt.hash(minhaSenha, saltRounds, (err, hash) => {
    if (err) console.error(err);
    else console.log(hash); 
});
