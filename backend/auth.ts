
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import 'dotenv/config';
import { Request, Response } from 'express';
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import moment from 'moment';
import sql from 'mssql';
import { dbConfig } from '.';

/**
 * Handler functions for authentication and user handling
 * 
 */

var jwt = require('jsonwebtoken');
console.log(process.env.DB_USERS_TABLE)
// region Query 
/** Queries database for supplied username and returns a bool: isUsernameAvailable */
export async function queryUsername (req: Request, res: Response) {
  const { username } = req.body
  try {
    // const result = await sql.query`SELECT Username FROM ${process.env.DB_USERS_TABLE} 
    // WHERE Username = ${username}`;  
    const queryString = "SELECT Username FROM " + process.env.DB_USERS_TABLE + " WHERE Username = @username";

    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input('username', sql.VarChar, username).query(queryString)
    // Username is found in the system
    if (result.rowsAffected[0] === 1) {
      res.status(200).json({isUsernameAvailable: false});
      return 
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message: 'Error querying database'});
    return
  }

  res.status(200).json({isUsernameAvailable: true});
  return
}

// region Register
/** Handles the registration of a user
 * @returns 200 If successful
 * @returns 400 If username or password is not supplied
 * @returns 409 If username is taken
 * @returns 500 If backend table insertion goes awry
 */
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

    // Generate password salt
    let newSalt = crypto.randomBytes(16).toString('base64');
    console.log(newSalt)
    let saltedPW = password + newSalt

    let hashedPW = await argon2.hash(saltedPW)
    console.log(hashedPW)

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
      await sql.query`
        INSERT INTO Test 
        (id)
        VALUES (${userID})
      `

      console.log("Successfully inserted a new user into the database!")
      res.status(200).json({message: 'Successfully registered a new user into the database!'})
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
/** Handles the login request for a user given username and password
 * @param Takes a raw JSON body: {username: '', password: ''}
 * @param dev Header: If supplied, sends an already expired token back to user
 * @returns 200 If everything matches up: Sets access and refresh token cookies in browser as Httponly
 * @returns 400 If username or password aren't provided with the request OR username is not found in database
 * @returns 401 If password does not match password in database
 * @returns 500 If error altering database
 */
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
          sameSite: 'none',
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
        sameSite: 'none',
      });

      res.cookie('spotify_accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      res.cookie('spotify_refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      
      
      // Try to save hashed refresh token with user
      try {      
        let hashedRefreshToken = await argon2.hash(refreshToken)
        console.log(hashedRefreshToken)
        const result = await sql.query`
          UPDATE Users
          SET HashedRefreshToken = ${hashedRefreshToken}
          WHERE Username = ${username}
        `;

        if (result.rowsAffected[0] === 0) {
          res.status(500).json({message: 'No refresh token was saved.'})
        }

      } catch (error) {
        console.log('Error saving refresh:', error);
        res.status(500).json({message: 'Error saving refresh token.'});
        return
      }

      console.log('User logged in successfully.');
      res.status(200).json({message: 'Logged in successfully.'});
      return

    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        res.status(500).json({message: 'Error fetching data: ' + error.message});
        return
      }
    }
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({message: 'Error fetching data: ' + error.message});
      return
    }
  }
}

// region Logout
// Is this counterintuitive, we want to clear the sites cookies on logout (Do we touch cookies in frontend?) and clear the hashedRefreshToken in the DB
/** Handle logout if authenticated to 
 * @returns 200 If successful deletion of cookies and hashed refresh token
 * @returns 500 If error performing operations
*/
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

// region Delete 
/** Handles deletion of User data
 * @returns 200 If successful
 * @returns 500 If error performing operations
 */
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
      res.status(500).json({message: 'Error deleting user from database'})
      return
    }
  }
}

// region Access token refresh
/** Handles issuing new access tokens based on supplied refresh token from cookies
 * @returns 200 If successful: New access token is set 
 * @returns 400 If refresh token is missing from request or Error verifying token
 * @returns 401 If refresh token is expired
 * @returns 500 If all else fails
 */
export async function handleRefresh(req: Request, res: Response) {
  console.log('Handle Refresh in backend')
  const refreshToken = req.cookies.spotify_refreshToken;

  if (refreshToken === undefined || refreshToken === null) {
    console.log('Refresh missing')
    res.status(400).json({message: 'Refresh token missing from request.'})
    return
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

      let accessToken = jwt.sign({username: username, userID: userID}, process.env.JWT_SECRET as string, { expiresIn: '1h' })

      res.cookie('spotify_accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
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
