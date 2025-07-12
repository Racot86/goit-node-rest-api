# Contacts API

This is a RESTful API for managing contacts with JWT authentication.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file:
   ```
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   PORT=3000
   JWT_SECRET=your_jwt_secret
   MAIL_APP_PASSWORD=your_mail_app_password
   ```
4. Start the server: `npm start` or `npm run dev` for development

## API Documentation with Swagger

This API is documented using Swagger. You can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- A comprehensive list of all available endpoints
- Request parameters, body schemas, and response formats
- The ability to try out API calls directly from the browser
- Authentication using JWT tokens

To use the authenticated endpoints in Swagger UI:
1. Execute the login endpoint to get a token
2. Click the "Authorize" button at the top of the page
3. Enter your token in the format: `Bearer YOUR_TOKEN`
4. Click "Authorize" and close the modal
5. Now you can access the authenticated endpoints

## Authentication Endpoints

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

Response:
```json
{
  "user": {
    "email": "user@example.com",
    "subscription": "starter",
    "avatarURL": "https://s.gravatar.com/avatar/..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "subscription": "starter",
    "avatarURL": "https://s.gravatar.com/avatar/..."
  }
}
```

### Logout (requires authentication)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get current user (requires authentication)
```bash
curl -X GET http://localhost:3000/api/auth/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "email": "user@example.com",
  "subscription": "starter",
  "avatarURL": "https://s.gravatar.com/avatar/..."
}
```

### Update avatar (requires authentication)
```bash
curl -X PATCH http://localhost:3000/api/auth/avatars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "avatar=@/path/to/image.jpg"
```

Response:
```json
{
  "avatarURL": "/avatars/1_image.jpg"
}
```

### Email Verification

After registration, users need to verify their email before they can log in. A verification email is sent to the user's email address with a link to verify their account.

#### Verify Email
```bash
curl -X GET http://localhost:3000/api/auth/verify/YOUR_VERIFICATION_TOKEN
```

Response (success):
```json
{
  "message": "Verification successful"
}
```

Response (token not found):
```json
{
  "message": "User not found"
}
```

#### Resend Verification Email
If the verification email is lost or expired, users can request a new one:

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

Response (success):
```json
{
  "message": "Verification email sent"
}
```

Response (already verified):
```json
{
  "message": "Verification has already been passed"
}
```

## Contacts Endpoints (all require authentication)

### GET all contacts
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET contact by ID
```bash
curl -X GET http://localhost:3000/api/contacts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### DELETE contact
```bash
curl -X DELETE http://localhost:3000/api/contacts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST new contact
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "(123) 456-7890", "favorite": false}'
```

### PUT (update) contact
```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "John Updated", "email": "updated@example.com", "favorite": true}'
```

### PATCH (update favorite status)
```bash
curl -X PATCH http://localhost:3000/api/contacts/1/favorite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"favorite": true}'
```

## Option 2: Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new request:
   - Set the HTTP method (GET, POST, PUT, DELETE)
   - Enter the URL (e.g., http://localhost:3000/api/contacts)
   - For authentication endpoints, no Authorization header is needed for register and login
   - For protected endpoints (all contacts endpoints and auth/logout, auth/current), add an Authorization header with value `Bearer YOUR_TOKEN`
   - For POST/PUT requests, go to the "Body" tab, select "raw" and "JSON", then enter your JSON data
   - Click "Send"

## Option 3: Using VS Code REST Client Extension

1. Install the "REST Client" extension in VS Code
2. Create a file named `requests.http` with the following content:

```http
### Register a new user
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Store the token from the login response
@token = YOUR_TOKEN_HERE

### Logout (requires authentication)
POST http://localhost:3000/api/auth/logout
Authorization: Bearer {{token}}

### Get current user (requires authentication)
GET http://localhost:3000/api/auth/current
Authorization: Bearer {{token}}

### Get all contacts (requires authentication)
GET http://localhost:3000/api/contacts
Authorization: Bearer {{token}}

### Get contact by ID (requires authentication)
GET http://localhost:3000/api/contacts/1
Authorization: Bearer {{token}}

### Delete contact (requires authentication)
DELETE http://localhost:3000/api/contacts/1
Authorization: Bearer {{token}}

### Create new contact (requires authentication)
POST http://localhost:3000/api/contacts
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(123) 456-7890",
  "favorite": false
}

### Update contact (requires authentication)
PUT http://localhost:3000/api/contacts/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "John Updated",
  "email": "updated@example.com",
  "favorite": true
}

### Update favorite status (requires authentication)
PATCH http://localhost:3000/api/contacts/1/favorite
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "favorite": true
}

### Verify Email
GET http://localhost:3000/api/auth/verify/YOUR_VERIFICATION_TOKEN

### Resend Verification Email
POST http://localhost:3000/api/auth/verify
Content-Type: application/json

{
  "email": "user@example.com"
}
```

3. After login, replace `YOUR_TOKEN_HERE` with the actual token from the login response
4. For the verify email endpoint, replace `YOUR_VERIFICATION_TOKEN` with the token received in the email
5. Click "Send Request" above each request to execute it

## Important Notes:
- Make sure your server is running (`npm start` or `npm run dev`)
- Replace `1` with an actual contact ID from your database
- The server runs on port 3000 as specified in your app.js file
- All contacts endpoints require authentication with a valid JWT token
- The token is obtained from the login endpoint and should be included in the Authorization header
