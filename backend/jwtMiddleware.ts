
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';


export const jwtMiddleware = async function (req: Request, res: Response, next) {
  // These paths will be non secure paths, users do not have to be logged in to access
  let nonSecureFlag = false
  const nonSecurePaths = ['/', '/about', 'contact', '/auth/login', '/auth/refresh', '/refresh', '/auth/register', '/auth/query/username', '/query/email', '/spotify', '/token']
  console.log('Path requested:', req.path)
  for (let i = 0; i < nonSecurePaths.length; i++){
    if (req.path === nonSecurePaths[i]) {
      nonSecureFlag = true
      break // Saving an extra lookup ?
    }
  }

  if (nonSecureFlag === false) {
    console.log('-JWT Auth-')
    // Verify the JWT token
    try {
      let token = req.cookies.spotify_accessToken as string
      //console.log(token)
      //console.log('Verifying JWT Token:', token)

      let verSession = jwt.verify(token, process.env.JWT_SECRET as string)

      // Set user data for the subsequent request 
      res.locals.session_data = verSession;
      next();
    } catch (error) {
      // if (error instanceof TokenExpiredError) {
      //   //res.redirect('/auth/refresh')
      //   // Access Token Expired: Now check refresh token
      //   return
      // }
      res.status(401).json({message: 'Unauthorized/Invalid token.'})
      return
    }
  } else {
    // console.log('-Non Secure path-', req.originalUrl)
    next()
  }
}
