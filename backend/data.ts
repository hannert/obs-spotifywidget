import { Request, Response } from "express";
import moment from "moment";
import sql from "mssql";

// region Link Applications
export async function handleSpotifyLink(req: Request, res: Response) {

  var code = req.query.code || null;
  var URL = 'https://accounts.spotify.com/api/token';

  // Need to get client_id and client_secret saved in DB
  var headers = new Headers({
    'content-type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + (Buffer.from(res.locals.client_id + ':' + res.locals.client_secret).toString('base64'))
  });

  var body = new URLSearchParams({
    'code': code as string,
    'redirect_uri': process.env.redirect_uri as string,
    'grant_type': 'authorization_code'
  });

  try {
    // Either save code or get tokens NOW and then SAVE!!
    const tokenResponse = await fetch(URL, {
      method: 'POST',
      headers: headers,
      body: body
    });

    const codeBody = await tokenResponse.json();

    let access_token = codeBody.access_token;
    let refresh_token = codeBody.refresh_token;
    let seconds = codeBody.expires_in;
    // Do we need to save the expires_in ? -> Ping API to see if unauthorized: if unsuccessful, use refresh token to get another access token
    // ! Don't actually need it since Spotify API doesn't really limit how many you can refresh, but in a system where it matters more to be conservatibe with API calls to reduce traffic, this can be implemented to shift more load onto our backend
    let expire_time = moment().add(seconds, 'seconds').utc().toDate();

    // Save into DB
    const dbAction = await sql.query`
      UPDATE Test
      SET
        Access_Token = ${access_token},
        Refresh_Token = ${refresh_token},
        Expires_At = ${expire_time} 
      WHERE id = ${1}
    `;

    if (dbAction.rowsAffected[0] === 1){
      res.status(200).json({message: 'Linking successful.'});
      return
    }
  } catch (error) {
    console.log(error);
  }   
   res.status(500).json({message: 'Error linking spotify application.'});
}
// region Save Token
// Save the token into DB
export async function saveTokens(req: Request, res: Response) {

  var access = req.query.access_token || null;
  var refresh = req.query.refresh_token || null;

  try {
    const result = await sql.query`
      UPDATE Test
      SET
        Access_Token = ${access}, 
        Refresh_Token = ${refresh}
      WHERE id = 1
    `;
    res.status(200).json({ message: 'Data inserted successfully!', data: result });
    return;
  } catch (error) {
    console.log(error);
  }
  res.status(500).json('Error saving tokens.');
}
// region Get Tokens
// Get the token from the DB
export async function getTokens(req: Request, res: Response) {

  var id = req.query.id || null;

  try {
    const result = await sql.query`
      SELECT Access_Token, Refresh_Token FROM Test  
      WHERE id = ${id}
      `;
    let userTokens = result.recordset[0];
    res.status(200).json({ data: userTokens });
    return
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({message: 'Error fetching tokens.'});
}
// region Refresh Tokens
// Refresh access token
export async function refreshTokens(req: Request, res: Response) {
  var id = req.query.id;
  var refresh_token = req.query.refresh as string;
  // Check if refresh is needed?
  try {
    const refreshResponse = await sql.query`
      SELECT EXPIRES_AT FROM Test WHERE id = ${id}
    `;
    let expiresAt = refreshResponse.recordset[0].EXPIRES_AT;
    let momentData = moment(expiresAt);

    // If the access token is not expired yet, return
    if (moment().isBefore(momentData)){
      console.log("Access token is still valid, returning.");
      res.status(400).json({message: 'Existing access token still valid.'});      
      return
    }

  } catch (error) {
    res.status(400).json({message: 'Error checking token validity.'});
    return
  }

  var URL = 'https://accounts.spotify.com/api/token';
  var headers = new Headers({
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(res.locals.client_id + ':' + res.locals.client_secret).toString('base64'))
  });
  var body = new URLSearchParams({
    'grant_type': 'refresh_token',
    'refresh_token': refresh_token
  });

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: headers,
      body: body
    });

    var data = await response.json();

    // Save into DB
    let expire_time = moment().add(data.expires_in, 'seconds').utc().toDate();
    let access_token = data.access_token;
    if (access_token !== null && access_token !== undefined) {
      const accessAction = await sql.query`
      UPDATE Test
      SET
        Access_Token = ${access_token}, 
        Expires_At = ${expire_time}
      WHERE id = ${1}
    `;}

    res.status(200).json({data: access_token});
    return
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({message: 'Internal error.'});
}