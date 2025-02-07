import * as crypto from 'crypto';
import { Request, Response } from "express";
import moment from "moment";
import sql from "mssql";

// region
export async function saveClientId(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;
  const client_id = req.body.client_id;
  console.log(user_id, client_id)
  try {
    const result = await sql.query`
      UPDATE Test
      SET
        Client_Id = ${client_id} 
      WHERE id = ${user_id}
    `;
    if (result.rowsAffected[0] === 1){
      res.status(200).json({ message: 'Client ID updated successfully!' });
      return;
    }
  } catch (error) {
    console.log(error);
  }
  res.status(500).json('Error saving Client ID.');
}

export async function saveClientSecret(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;
  const client_secret = req.body.client_secret

  try {
    const result = await sql.query`
      UPDATE Test
      SET
        Client_Secret = ${client_secret} 
      WHERE id = ${user_id}
    `;
    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: 'Client Secret updated successfully!' });
      return;      
    }
  } catch (error) {
    console.log(error);
  }
  res.status(500).json('Error saving Client Secret.');
}

export async function getClient(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;
  console.log(user_id)
  try {
    const result = await sql.query`
      SELECT Client_ID, Client_Secret FROM Test 
      WHERE id = ${user_id}
    `;
    let data = result.recordset[0]
    res.status(200).json({ data: data });
    return;
  } catch (error) {
    console.log(error);
  }
  res.status(500).json('Error getting Client ID & Secret.');
}

export async function getLinkSecret(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;

  try {
    const result = await sql.query`
      SELECT App_Secret FROM Test 
      WHERE id = ${user_id}
    `;
    let data = result.recordset[0]
    res.status(200).json({ data: data });
    return;
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({message: 'Error getting App Secret.'});
}


async function generateSecret() {
  while (true) {
    let newSecret = crypto.randomBytes(16).toString('base64');
    console.log('generate', newSecret)
    const resultDuplicate = await sql.query`
      SELECT Expires_At FROM Test WHERE App_Secret = ${newSecret}
    `;

    if (resultDuplicate.rowsAffected[0] === 0) {
      return newSecret
    }
  }
}


export async function regenerateSecret(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;

  try {
    // Check if secret is in DB
    let newSecret: string = await generateSecret()
    console.log('new secret', newSecret)

    const result = await sql.query`
      UPDATE Test
      SET App_Secret = ${newSecret} 
      WHERE id = ${user_id} 
    `;

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ data: {secret: newSecret} });
      return;
    }
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({ message: 'Error getting App Secret.'});
}

// region Link Applications
/** Handles authorization of spotify app to our application */
export async function handleSpotifyLink(req: Request, res: Response) {

  var code = req.query.code || null;
  var URL = 'https://accounts.spotify.com/api/token';
  const user_id = res.locals.session_data.userID;
  var client_id: string = '';
  var client_secret: string = '';

  // Need to get client_id and client_secret saved in DB
  try {
    const result = await sql.query`
      SELECT Client_ID, Client_Secret
      FROM Test 
      WHERE id = ${user_id}
    `;
    if (result.rowsAffected[0] !== 1) {
      res.status(400).json({message: 'Error. User not found'});
      return
    }
    //console.log(result.recordset[0])
    if (result.recordset[0].Client_ID === null || result.recordset[0].Client_Secret === null) {
      res.status(400).json({message: 'Client ID and Client Secret must be supplied.'});
      return
    }

    client_id = result.recordset[0].Client_ID;
    client_secret = result.recordset[0].Client_Secret;

  } catch (error) {
    res.status(400).json({message: 'Error getting Client ID or Secret'});
    return
  }

  //console.log("ID and secret fetched from db", client_id, client_secret)
  var headers = new Headers({
    'content-type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
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

    if (tokenResponse.status !== 200) {
      res.status(tokenResponse.status).json({message: 'Error Linking.'});
      return
    }

    const codeBody = await tokenResponse.json();

    let access_token = codeBody.access_token;
    let refresh_token = codeBody.refresh_token;
    let seconds = codeBody.expires_in;
    // Do we need to save the expires_in ? -> Ping API to see if unauthorized: if unsuccessful, use refresh token to get another access token
    // ! Don't actually need it since Spotify API doesn't really limit how many you can refresh, but in a system where it matters more to be conservatibe with API calls to reduce traffic, this can be implemented to shift more load onto our backend
    let expire_time = moment().add(seconds, 'seconds').utc().toDate();

    const user_id = res.locals.session_data.userID;
    // Save into DB
    const dbAction = await sql.query`
      UPDATE Test
      SET
        Access_Token = ${access_token},
        Refresh_Token = ${refresh_token},
        Expires_At = ${expire_time} 
      WHERE id = ${user_id}
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
  console.log("saving token")
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

  var secret = req.query.secret || null;
  console.log('secret:', secret)
  try {
    const result = await sql.query`
      SELECT Access_Token, Refresh_Token FROM Test  
      WHERE App_Secret = ${secret}
      `;
    console.log(result)
    let userTokens = result.recordset[0];
    res.status(200).json({ data: userTokens });
    return
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({message: 'Error fetching tokens.'});
}
// region Refresh Tokens
// Refresh Spotify API access token
export async function refreshTokens(req: Request, res: Response) {
  console.log("refreshing token")
  var secret = req.query.secret;
  var refresh_token = req.query.refresh as string;
  console.log(secret)
  // Check if refresh is needed?
  try {
    const refreshResponse = await sql.query`
      SELECT EXPIRES_AT FROM Test WHERE App_Secret = ${secret}
    `;

    console.log('refreshResponse: ', refreshResponse)
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


  var client_id: string = '';
  var client_secret: string = '';

  // Need to get client_id and client_secret saved in DB
  try {
    const result = await sql.query`
      SELECT Client_ID, Client_Secret
      FROM Test 
      WHERE App_Secret = ${secret}
    `;
    if (result.rowsAffected[0] !== 1) {
      res.status(400).json({message: 'Error. User not found'});
      return
    }
    console.log(result.recordset[0])
    if (result.recordset[0].Client_ID === null || result.recordset[0].Client_Secret === null) {
      res.status(400).json({message: 'Client ID and Client Secret must be supplied.'});
      return
    }

    client_id = result.recordset[0].Client_ID;
    client_secret = result.recordset[0].Client_Secret;

  } catch (error) {
    res.status(400).json({message: 'Error getting Client ID or Secret'});
    return
  }



  var URL = 'https://accounts.spotify.com/api/token';
  var headers = new Headers({
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
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
    console.log('data', data)
    // Save into DB
    let expire_time = moment().add(data.expires_in, 'seconds').utc().toDate();
    let access_token = data.access_token;
    if (access_token !== null && access_token !== undefined) {
      const accessAction = await sql.query`
      UPDATE Test
      SET
        Access_Token = ${access_token}, 
        Expires_At = ${expire_time}
      WHERE App_Secret = ${secret}
    `;}
      console.log('Success, access token:', access_token)
    res.status(200).json({data: access_token});
    return
  } catch (error) {
    console.log(error);
  }
  res.status(500).json({message: 'Internal error.'});
}