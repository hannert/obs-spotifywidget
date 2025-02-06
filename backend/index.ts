import cors from 'cors';
import 'dotenv/config';
import express, { Express } from 'express';
import sql from 'mssql';
import { handleDelete, handleLogin, handleLogout, handleRefresh, handleRegister, queryUsername } from './auth';
import { getClient, getLinkSecret, getTokens, handleSpotifyLink, refreshTokens, regenerateSecret, saveClientId, saveClientSecret, saveTokens } from './data';
import { jwtMiddleware } from './jwtMiddleware';


console.log(process.env.DB_USER)


let client_id = process.env.client_id
let client_secret = process.env.client_secret
var redirect_uri = 'http://localhost:' + process.env.PORT + '/callback';

const app: Express = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');




// region Middleware
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))
app.use(cookieParser())
app.use(express.json())
app.use(jwtMiddleware)


// region Database 
// Database connection config
const dbConfig: sql.config = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  server: process.env.DB_SERVER as string,
  options: {
    encrypt: true, // Use encryption when connecting to Azure
    trustServerCertificate: true, // Change to false if you have a valid certificate
  },
  
};

// Connect to Azure SQL Database and handle errors
async function connectToDb() {
  try {
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
// TODO Have a front end link that calls this route and gives feedback
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

app.listen(process.env.port, () => {
  console.log('Listening', process.env.port);
  connectToDb();
})