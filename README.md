
# Chat App Backend

This is the backend for the real-time chat application using **Express**, **Socket.IO**, and **MongoDB (Mongoose)**.  

It supports real-time messaging, likes, and comments.

---

---

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd <repo-folder>
````

2. Install dependencies:

```bash
npm install
```

3. Install **nodemon** globally (optional, for development):

```bash
npm install -g nodemon
```

Or as a dev dependency:

```bash
npm install --save-dev nodemon
```

---

## Environment Variables

Create a `.env` file in the `src/` folder based on the `.env.example` file:

```
src/.env.example
```

Example `.env`:

```env
MONGO_URI=mongodb:
PORT=3000
```

* `MONGO_URI` — Your MongoDB connection string
* `PORT` — Port for the server (default: 3000)

---

## Running the Server

### Development (with nodemon)

```bash
npx nodemon src/index.js
```

or if installed globally:

```bash
nodemon src/index.js
```

### Production

```bash
node src/index.js
```

---

## Project Structure

```
src/
├─ models/          # Mongoose schemas (Message, Comment, etc.)
├─ server.js        # Express & Socket.IO setup
├─ index.js         # Entry point
├─ .env.example     # Environment variable template
```

---

## Notes

* Messages, likes, and comments are persisted in MongoDB.
* Socket.IO handles real-time updates.
* Ensure MongoDB is running before starting the server.

---



