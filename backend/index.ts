import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import sql from 'mssql';
import yn from 'yn';
import { handleDelete, handleLogin, handleLogout, handleRefresh, handleRegister, queryUsername } from './auth';
import { getClient, getLinkSecret, getTokens, handleSpotifyLink, refreshTokens, regenerateSecret, saveClientId, saveClientSecret, saveTokens } from './data';
import { jwtMiddleware } from './jwtMiddleware';

dotenv.config({ path: `.env.${process.env.NODE_ENV}`});
console.log(`.env.${process.env.NODE_ENV}`)

export const base_url = process.env.BASE_URL;

const app: Express = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// region Middleware
app.use(cors({
  credentials: true,
  origin: base_url
}))
app.use(cookieParser())
app.use(express.json())
app.use(jwtMiddleware)


// region Database 
// Database connection config
export const dbConfig: sql.config = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  server: process.env.DB_SERVER as string,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: yn(process.env.DB_ENCRYPT) ?? true, // Use encryption when connecting to Azure
    trustServerCertificate: yn(process.env.DB_TRUST_SERVER) || false, // Change to false if you have a valid certificate
  },
};

// Connect to Azure SQL Database and handle errors
async function connectToDb() {
  try {
    console.log(dbConfig)
    await sql.connect(dbConfig);
    console.log('Connected to Azure SQL Database!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// region Data Handling
app.get('/client', getClient);
app.post('/client/id', saveClientId);
app.post('/client/secret', saveClientSecret);
app.post('/regenerate', regenerateSecret);

app.get('/secret', getLinkSecret)
app.get('/callback', handleSpotifyLink);
app.post('/token', saveTokens);
app.get('/token', getTokens);
app.get('/refresh', refreshTokens);


// region Authentication
app.post('/auth/login', handleLogin);
app.post('/auth/register', handleRegister);
app.post('/auth/query/username', queryUsername);
app.post('/auth/logout', handleLogout);
app.post('/auth/delete', handleDelete);
app.post('/auth/refresh', handleRefresh);

app.listen(process.env.PORT || 80, () => {
  console.log('Listening', process.env.PORT);
  connectToDb();
})