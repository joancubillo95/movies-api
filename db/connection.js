import "dotenv/config";
import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
    },
    pool: {
        max: 2,
        min: 0,
        idleTimeoutMillis: 20000
    }
};

const pool = new sql.ConnectionPool(config)
const poolConnect = await pool.connect()

const createTransaction = async () => {
    return await new sql.Transaction(poolConnect)
}

const query = async (sqlString) => {
    const result = await poolConnect.request().query(sqlString)
    return result.recordset
}

export { poolConnect, query, createTransaction }