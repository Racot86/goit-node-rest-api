To test your REST API, you can send sample requests using various tools. Here are some options with examples for each endpoint:

## Option 1: Using cURL (Command Line)

### GET all contacts
```bash
curl -X GET http://localhost:3000/api/contacts
```

### GET contact by ID
```bash
curl -X GET http://localhost:3000/api/contacts/1
```

### DELETE contact
```bash
curl -X DELETE http://localhost:3000/api/contacts/1
```

### POST new contact
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "(123) 456-7890", "favorite": false}'
```

### PUT (update) contact
```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "email": "updated@example.com", "favorite": true}'
```

## Option 2: Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new request:
   - Set the HTTP method (GET, POST, PUT, DELETE)
   - Enter the URL (e.g., http://localhost:3000/api/contacts)
   - For POST/PUT requests, go to the "Body" tab, select "raw" and "JSON", then enter your JSON data
   - Click "Send"

## Option 3: Using VS Code REST Client Extension

1. Install the "REST Client" extension in VS Code
2. Create a file named `requests.http` with the following content:

```http
### Get all contacts
GET http://localhost:3000/api/contacts

### Get contact by ID
GET http://localhost:3000/api/contacts/1

### Delete contact
DELETE http://localhost:3000/api/contacts/1

### Create new contact
POST http://localhost:3000/api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(123) 456-7890",
  "favorite": false
}

### Update contact
PUT http://localhost:3000/api/contacts/1
Content-Type: application/json

{
  "name": "John Updated",
  "email": "updated@example.com",
  "favorite": true
}
```

3. Click "Send Request" above each request to execute it

## Important Notes:
- Make sure your server is running (`npm start` or `node app.js`)
- Replace `1` with an actual contact ID from your database
- The server runs on port 3000 as specified in your app.js file
