
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';


export const jwtMiddleware = async function (req: Request, res: Response, next) {
  // These paths will be non secure paths, users do not have to be logged in to access
  let nonSecureFlag = false
  const nonSecurePaths = ['/', '/about', 'contact', '/auth/login', '/refresh', '/register', '/query/username', '/query/email']
  
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
      //let token = authHeader.split(' ')[1]
      let token = req.cookies['sw_access_token'] as string
      //console.log('Verifying JWT Token:', token)
      let verSession = jwt.verify(token, process.env.JWT_SECRET as string)
      //console.log('verSession:', verSession)
      // Set user data for the subsequent request 
      res.locals.session_data = verSession;
      // c.set('UserID', userID)
      await next();
    } catch (error) {
      res.status(400).json({message: 'Unauthorized/Invalid token.'})
      return
    }
  } else {
    console.log('-Non Secure path-', req.originalUrl)
    next()
  }
}
