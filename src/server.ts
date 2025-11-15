import {Request, Response, NextFunction} from "express"
import dotenv from "dotenv"

import app from "./app"

dotenv.config()

const port = Number(process.env.PORT)

app.listen(port, () => {
    console.log(`App listening on port: ${port}... `)
})