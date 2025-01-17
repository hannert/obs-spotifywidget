import cors from 'cors';
import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import sql from 'mssql';



console.log(process.env.DB_USER)


let client_id = 'f2df842d1adc42c9b173d709cda23909'
var redirect_uri = 'http://localhost:3000/callback';

const app: Express = express();

app.use(cors({
  origin: '*'
}))



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



app.get('/login', function(req: Request, res: Response) {


  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
    }).toString());
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
    }).toString());
});

app.get('/spotify', function(req,res) {

  var userID = req.query.id;
  // Get the tokens in database for this user







})

app.listen(process.env.port, () => {
  console.log('Listening')
})