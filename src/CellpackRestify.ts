
import { Cellpack } from "microb"
import * as Restify from "restify"
import * as CookieParser from "restify-cookies"

export class CellpackRestify extends Cellpack {
    //
    server: Restify.Server

    constructor(){
        super()
        console.log("Init CellpackRestify.")
    }

    init(){
        this.startServer()
    }

    private startServer(){
        this.server = Restify.createServer()
        //
        this.server.use(Restify.pre.sanitizePath())
        this.server.use(Restify.bodyParser({
            mapParams: false
        }))
        this.server.use(Restify.queryParser())
        // this.server.use(CookieParser.parse)
        this.server.use((req,res,next) => {
            console.log(req.cookies)
        })

        this.server.get(".*", (req,res,next) => {})
        this.server.post(".*", (req,res,next) => {})
        this.server.head(".*", (req,res,next) => {})
        this.server.del(".*", (req,res,next) => {})
        this.server.put(".*", (req,res,next) => {})
        this.server.opts(".*", (req,res,next) => {})

        this.server.listen(15000)
    }
}
