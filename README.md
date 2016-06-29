# Sup - a messaging API

Sup is a simple messaging API.  Users can be created, updated, edited, and deleted.  Messages can be sent between any two users of Sup.

## API Documentation

### Users endpoints

#### `/users`

Endpoint representing all users of Sup.

```
GET /users
```

Get an array of all users of Sup.

*URL parameters*:

None

*Data parameters*:

None

*Query string parameters*:

None

*Returns*:

An array of all users.

*Example*:

```
> GET /users

< Status: 200 OK
< [
<     {
<         "_id": "000000000000000000000000",
<         "username": "alice"
<     }
< ]
```

***

```
POST /users
```

Add a user to Sup

*URL Parameters*:

None

*Data parameters*:

* The user to add

*Query string parameters*:

None

*Returns*:

An empty object.

*Example*:

```
> POST /users
> {
>     "username": "alice"
> }

< Status: 201 Created
< Location: /users/000000000000000000000000
< {
< }
```

#### `/users/:userId`

Endpoint representing a single user of Sup.

```
GET /users/:userId
```

Get a single user of Sup.

*URL parameters*:

* `userId` - The ObjectId of the user.

*Data parameters*:

None

*Query string parameters*:

None

*Returns*:

A JSON object of the user.

*Example*:

```
> GET /users/000000000000000000000000

< Status: 200 OK
< {
<     "_id": "000000000000000000000000",
<     "username": "alice"
< }
```

***

```
PUT /users/:userId
```

Add or edit a Sup user.

*URL parameters*:

* `userId` - The ObjectId of the user to add or edit.

*Data parameters*:

* The user to add or edit

*Query string parameters*:

None

*Returns*:

An empty object.

*Example*:

```
> PUT /users/0000000000000000000000000
> {
>     "username": "alice"
> }

< Status: 200 OK
< {
< }
```

***

```
DELETE /users/:userId
```

Delete a Sup user.

*URL parameters*:

* `userId` - The ObjectId of the user to delete.

*Data parameters*:

None

*Query string parameters*:

None

*Returns*:

An empty object.

*Example*:

```
> DELETE /users/0000000000000000000000000

< Status: 200 OK
< {
< }
```

### Messages endpoints

#### `/messages`

Endpoint representing all messages in Sup.

```
GET /messages
```

Get an array of messages in Sup.

*URL parameters*:

None

*Data parameters*:

None

*Query string parameters*:

* `from` - Only select messages from the user with the corresponding ObjectId
* `to` - Only select messages to the user with the corresponding ObjectId

*Returns*:

An array of messages.

*Example*:

```
> GET /messages

< Status: 200 OK
< [
<     {
<         "_id": "000000000000000000000000",
<         "text": "Hi Bob",
<         "from": {
<             "_id": "0000000000000000000000000",
<             "username": "alice"
<         },
<         "to": {
<             "_id": "1111111111111111111111111",
<             "username": "bob"
<         }
<     }
< ]
```

***

```
POST /messages
```

Add a message.

*URL Parameters*:

None

*Data parameters*:

* The message to add, with a sender and recipient

*Query string parameters*:

None

*Returns*:

An empty object.

*Example*:

```
> POST /messages
> {
>     "text": "Hi Bob",
>     "from": "0000000000000000000000000",
>     "to": "1111111111111111111111111"
> }

< Status: 201 Created
< Location: /messages/000000000000000000000000
< {
< }
```

#### `/message/:messageId`

Endpoint representing a single message.

```
GET /messages/:messageId
```

Get a single message.

*URL parameters*:

* `messageId` - The ObjectId of the message.

*Data parameters*:

None

*Query string parameters*:

None

*Returns*:

A JSON object of the message.

*Example*:

```
> GET /messages/000000000000000000000000

< Status: 200 OK
< {
<     "_id": "000000000000000000000000",
<     "text": "Hi Bob",
<     "from": {
<         "_id": "0000000000000000000000000",
<         "username": "alice"
<     },
<     "to": {
<         "_id": "1111111111111111111111111",
<         "username": "bob"
<     }
< }
```

### Error objects

If an error occurs then the API will send a JSON error object in the following format, with an appropriate status code:

```js
{
    "message": "A description of the error"
}
```


