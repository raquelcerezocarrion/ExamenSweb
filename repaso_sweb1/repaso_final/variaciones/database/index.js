const database = {};

database.user = require('./models/user.model');

function initializeUsers(){
    const NAMES = ["alberto", "ana", "daniel", "silvia"];
    NAMES.forEach(function(username){
        database.user.register(username, "1234", "emailprueba@gmail.com");
    });
}

function initializeAdmin() {
    const USERS = [
        {username: 'admin', password:'admin1234', email: 'admin@gmail.com', role: 'admin'}
    ];
    USERS.forEach( user => {
        database.user.register(user.username, user.password, user.email, user.role);
    });
}

function initializeDB(){
    initializeUsers();
    initializeAdmin();
}

initializeDB();

module.exports = database;