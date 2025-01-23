
import sql from 'mssql';
import moment from 'moment';


export async function (c) {
  const { username, password, email, firstName, lastName} = await c.req.json() 

  if (!username || !password) {
    return c.text('invalid username or password', 400)
  }

  try {
    const result = await sql.query`SELECT Username FROM Users WHERE Username = ${username}`;


    // Username is not found in the system
    if (result.rowsAffected[0] === 1) {
      return c.text('Username is taken.', 409)
    }

    let newSalt = crypto.randomBytes(16)
    console.log(newSalt)
    let saltedPW = password + newSalt

    let hashedPW = await argon2.hash(saltedPW)
    console.log(hashedPW)


    let date: Date = new Date()
    let dateCreated = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('Account', username, 'created on', dateCreated)

    try {
      const result = await sql.query`
        INSERT INTO Users 
        (Username, HashedPassword, PasswordSalt, FirstName, LastName, Email, DateCreated)
        VALUES (${username}, ${hashedPW}, ${newSalt}, ${firstName}, ${lastName}, ${email}, ${dateCreated})`;

      console.log("Successfully inserted a new user into the database!")

      // TODO v Log the user in here and make a JWT token to create a session for them v



    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return c.text('Error with new user creation: ' + error.message, 500);
      }
    }
}