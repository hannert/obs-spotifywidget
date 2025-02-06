
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import moment from 'moment';
import sql from 'mssql';

var jwt = require('jsonwebtoken');

export async function queryUsername (req: Request, res: Response) {
  const { username } = req.body
  try {
    const result = await sql.query`SELECT Username FROM Users WHERE Username = ${username}`;  
    // Username is found in the system
    if (result.rowsAffected[0] === 1) {
      res.status(200).json({isUsernameAvailable: false});
      return 
    }
  } catch (error) {
    res.status(500).json({message: 'Error querying database'});
    return
  }

  res.status(200).json({isUsernameAvailable: true});
  return
}

// region Register
export async function handleRegister(req: Request, res: Response) {
  const { username, password, email } = req.body;

  if (!username || !password) {
    res.status(400).json({message: 'invalid username or password'});
    return
  }

  try {
    const result = await sql.query`SELECT Username FROM Users WHERE Username = ${username}`;

    // Username is not found in the system
    if (result.rowsAffected[0] === 1) {
      res.status(409).json({message: 'Username is taken.'});
      return 
    }

    let newSalt = crypto.randomBytes(16).toString('base64');
    console.log(newSalt)
    let saltedPW = password + newSalt

    let hashedPW = await argon2.hash(saltedPW)
    console.log(hashedPW)


    let date: Date = new Date()
    let dateCreated = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('Account', username, 'created on', dateCreated)

    try {
      const userResult = await sql.query`
        INSERT INTO Users 
        (Username, HashedPassword, PasswordSalt, Email, DateCreated)
        OUTPUT INSERTED.UserID 
        VALUES (${username}, ${hashedPW}, ${newSalt}, ${email}, ${dateCreated})`;

      const userID = userResult.recordset[0].UserID;
      
      // Create a row in the data table
      const dataResult = await sql.query`
        INSERT INTO Test 
        (id)
        VALUES (${userID})
      `

      console.log("Successfully inserted a new user into the database!")
      res.status(200).json({message: 'Successfully registered a new user into the database!'})
      // TODO v Log the user in here and make a JWT token to create a session for them v

    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        res.status(500).json({message: 'Error with new user creation: ' + error.message});
      }
    }
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
       res.status(500).json({message: 'Error with new user creation: ' + error.message});
    }
  }
}


// region Login
export async function handleLogin(req: Request, res: Response) {
  // Create a JWT token to send back to user
  // Server recieves username and password 
  // First we check if the username exists in our database
  // -> We must salt the password with the user's unique salt and then hash it then compare 
  // -> If valid, send an access token and a refresh token (stored in httpOnly cookies)
  // --> Store a hashed refresh token in the database with the user and whenever we check it, compare the hashed versions

  const {dev} = req.headers;
  console.log('dev', dev);
  const { username, password } = req.body;
  console.log(username, password)
  if (!username || !password) {
    res.status(400).json({message: 'invalid username or password'});
    return
  }
 
  try {
    console.log("auth trying to find username ", username)
    const result = await sql.query`SELECT UserID, Username, HashedPassword, PasswordSalt FROM Users WHERE Username = ${username}`;
    console.log(result)
    // Username is not found in the system
    if (result.rowsAffected[0] === 0) {
      res.status(400).json({message: 'invalid username or password'});
      return
    }
    let salt = result.recordset[0].PasswordSalt
    let saltedPW = password + salt
    console.log(result.recordset[0].HashedPassword, saltedPW)
    try {
      const match = await argon2.verify(result.recordset[0].HashedPassword, saltedPW)
      console.log(match)
      if (match === false) {
        console.log('Invalid login.')
        res.status(401).json({message: 'Invalid credentials.'});
        return
      }
      console.log("Hashed Password verified, successful login")
      // Return login authentification

      if (dev) {
        console.log("Sending a backdated JWT")
        let signedToken = jwt.sign({username: username }, process.env.JWT_SECRET as string, { expiresIn: '0s' })

        res.cookie('spotify_accessToken', signedToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        });
        
        res.status(200).json({data: signedToken});
        return

      }
      console.log(result);
      let userID = result.recordset[0].UserID;
      let accessToken = jwt.sign({username: username, userID: userID}, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      
      let refreshToken = jwt.sign({username: username}, process.env.JWT_SECRET as string, { expiresIn: '7d' });

      res.cookie('spotify_userName', username, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });

      res.cookie('spotify_accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });

      res.cookie('spotify_refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
      

      try {      
        let hashedRefreshToken = await argon2.hash(refreshToken)
        console.log(hashedRefreshToken)
        const result = await sql.query`
          UPDATE Users
          SET HashedRefreshToken = ${hashedRefreshToken}
          WHERE Username = ${username}
        `;      
      } catch (error) {
        console.log('Error saving refresh:', error);
        res.status(500).json({message: 'Error saving refresh token'});
        return
      }


      let response = {userName: username, accessToken: accessToken, refreshToken: refreshToken}
      console.log('User logged in successfully, sending back Tokens');
      res.status(200).json(response);
      return


    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        res.status(500).json({message: 'Error fetching data: ' + error.message});
        return
      }
    }



    console.log(result)

    


  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({message: 'Error fetching data: ' + error.message});
      return
    }
  }
}

// region Logout
export async function handleLogout(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;

  try {
    const result = await sql.query`
      UPDATE Users 
      SET HashedRefreshToken = NULL 
      WHERE UserID = ${user_id}
    `;

    res.clearCookie('spotify_accessToken');
    res.clearCookie('spotify_refreshToken');

    res.status(200).json({message: 'Logged out successfully.'})
    return

  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500)
      return
    }
  }
  res.status(500)
}

export async function handleDelete(req: Request, res: Response) {
  const user_id = res.locals.session_data.userID;
  try {
    const result = await sql.query`
      DELETE FROM Test 
      WHERE id = ${user_id}
    `;

    const userResult = await sql.query`
      DELETE FROM Users 
      WHERE UserID = ${user_id}
    `;

    res.clearCookie('spotify_accessToken');
    res.clearCookie('spotify_refreshToken');

    res.status(200).json({message: 'User deleted successfully.'})
    return

  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500)
      return
    }
  }
  res.status(500)
}

// region Access token refresh
export async function handleRefresh(req: Request, res: Response) {
  console.log('Handle Refresh in backend')
  const refreshToken = req.cookies.spotify_refreshToken;

  if (refreshToken === undefined || refreshToken === null) {

  }

  console.log('refresh:', refreshToken)
  try {
    // Verify that the refresh token is still valid
    let decodedToken = jwt.verify(refreshToken as string, process.env.JWT_SECRET as string) as JwtPayload

    let result = await sql.query`SELECT UserID, Username, HashedRefreshToken FROM Users WHERE Username = ${decodedToken.username}`;

    // Hashed refresh token matches, correct user
    if (
      (result.rowsAffected[0] === 1) && 
      (await argon2.verify(result.recordset[0].HashedRefreshToken, refreshToken as string) === true
    )) {
      console.log('Hashed refresh token matches')
      let userID = result.recordset[0].UserID;
      let username = result.recordset[0].Username;

      let accessToken = jwt.sign({username: username, userID: userID}, process.env.JWT_SECRET as string, { expiresIn: '2s' })

      res.cookie('spotify_accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
      res.status(200).json({ message: 'Successful access token refresh.'});
      return
    }
  } catch (error) {
    // Refresh token is expired, clear cookies
    if (error === TokenExpiredError) {
      res.clearCookie('spotify_accessToken');
      res.clearCookie('spotify_refreshToken');
      res.status(401).json({ message: 'Refresh token expired.' });
      return
    }


    res.status(400).json({ message: 'Error verifying token.'});
    return
  }
  res.status(500).json({ message: 'Unsuccessful token refresh.'});
  return
}
