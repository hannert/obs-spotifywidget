A web page that stores user's spotify API key and creates a secret link to use in OBS to display song details while streaming.

![Graphic](https://github.com/user-attachments/assets/8c5c5a6d-8d1a-43b8-bdfc-9b33bf83ac7c)

![Demo](https://github.com/user-attachments/assets/d1af7a2c-ff95-4a1e-9d8c-d4cced384011)


![Stream Example](https://github.com/user-attachments/assets/8da62fcc-052d-4ac9-8154-d873c928e7c0)
<sub>An example used in OBS, located in the bottom left of the screen.</sub>
## Getting Started
This is a monorepo, seperating frontend and backend to their own folders.

## Frontend
For frontend development:
- Uses Next.js

```bash
cd frontend
npm i
npm run dev
```
> Uses experimental Next.js feature to run localhost through HTTPS.
> ** Spotify Web API needs to be redirected to **

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.

## Backend
For backend development:

```bash
cd backend
npm i
npm run start
```
Uses cross-env .env files based on script ran.
Development ENV example:
- HOST=`127.0.0.1`

- BASE_URL=`https://localhost:3000`
- SELF_URL=`http://localhost:3001`

- JWT_SECRET=`<Generate a secret somewhere>`
- PROD=`false`

- DB_SERVER=`localhost\MSSQLSERVER`
- DB_USER=`dev_test`
- DB_PASSWORD=`123`
- DB_DATABASE=`TestDB`
- DB_ENCRYPT=`true`
- DB_TRUST_SERVER=`true`
- DB_USERS_TABLE=`Users`
- DB_SPOTIFY_TABLE=`Spotify`

- PORT=`3001`
  
### SQL Layout
I use Azure Data Studio to manage my DB locally.
> Make sure to set the server to accept remote connections in an SQL server manager!

- User Table Layout
  
| UserID | UserName   | HashedPassword | PasswordSalt | HashedRefreshToken |
| ------ | ---------- | -------------- | ------------ | ------------------ |
| int    | varchar(x) | varchar(x)     | nvarchar(x)  | varchar(x)         |

- Spotify Data Table Layout

| id  | Access_Token | Refresh_Token | Expires_At   | Client_Id     | Client_Secret | App_Secret  |
| --- | ------------ | ------------- | ------------ | ------------- | ------------- | ----------- |
| int | nvarchar(x)  | nvarchar(x)   | datetime2(7) | nvarchar(x)   | nvarchar(x)   | nvarchar(x) |


> To see table layout, you can check out the setup.sql file for the table construction in the SQL database.
> located at: ** backend/docker/db/setup.sql **

