const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'edxonline'
});
conn.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});
module.exports = conn;
