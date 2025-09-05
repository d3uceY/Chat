import app from "./server.js";


// env.config()
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    return console.log(`this server is running on port: ${port} `)
})