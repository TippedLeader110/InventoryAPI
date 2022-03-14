let mysql = require('mysqli');

let conn = new mysql({
    host: 'localhost',
    post: '3306',
    user: 'root',
    passwd: '',
    db: 'inv'
})

let db = conn.emit(false, '')

module.exports = {
    database : db
}