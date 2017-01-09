import * as Restify from "restify"
import * as CookieParser from "restify-cookies"
import * as Promise from "bluebird"
import * as Moment from "moment"
// import * as Ip from "ip-address"
//
import { Cellpack, Connection, Request, Transmitter, Cookie } from "microb"

export default class CellpackRestify extends Cellpack {
    //
    server: Restify.Server

    // constructor(config: any, transmitter: Transmitter){
        // super(config,transmitter)
    // }

    init(){
        this.config = this.environment.get("cellpacks")["cellpack-restify"]

        // create server
        this.server = Restify.createServer()
        //
        this.server.use(Restify.pre.sanitizePath())
        this.server.use(Restify.bodyParser({
            mapParams: false
        }))
        this.server.use(Restify.queryParser())
        this.server.use(CookieParser.parse)
        this.server.use((req: Restify.Request,res: Restify.Response, next: Restify.Next) => {
            this.rawRequest.call(this,req,res,next)
        })
        this.transmitter.on("microb.response",this.response)

        this.server.get(".*", (req,res,next) => {})
        this.server.post(".*", (req,res,next) => {})
        this.server.head(".*", (req,res,next) => {})
        this.server.del(".*", (req,res,next) => {})
        this.server.put(".*", (req,res,next) => {})
        this.server.opts(".*", (req,res,next) => {})

        // start
        // return new Promise<void>((resolve, reject) => {
            // this.server.listen(this.config.port,() => {
                // return resolve()
            // })
        // })

        this.transmitter.on("microb.loaded", () => {
            this.transmitter.emit("log.cellpack.restify",`Listening on port: ${this.config.port}`)
            this.server.listen(this.config.port)
        })

        return Promise.resolve()
    }

    private rawRequest(req: Restify.Request,res: Restify.Response, next: Restify.Next): void {
        let connection = new Connection()
        connection.request.raw = req
        connection.response.raw = res

        let [hostname,port] = req.headers.host.split(':')
        connection.request.host = hostname
        connection.request.port = port
        connection.request.path = req.getPath()
        connection.request.protocol = req.isSecure() ? "https" : "http"
        connection.request.agent = req.headers["user-agent"] || ""

        if(req.method === "GET") connection.request.method = Request.Method.GET
        else if(req.method === "POST") connection.request.method = Request.Method.POST
        else if(req.method === "HEAD") connection.request.method = Request.Method.HEAD
        else if(req.method === "PUT") connection.request.method = Request.Method.PUT
        else if(req.method === "DELETE") connection.request.method = Request.Method.DELETE
        else if(req.method === "OPTIONS") connection.request.method = Request.Method.OPTIONS

        // headers
        Object.keys(req.headers).forEach((key,index,arr) => {
            connection.request.headers.set(key.toLowerCase(),req.headers[key])
        })

        // we need lowercased headers so ...
        let dirtyIps = connection.request.headers.get("x-real-ip",connection.request.headers.get("x-forwarded-for",req.connection.remoteAddress))
        let dirtyipsArray = dirtyIps.split(",") // can be more IPs
        let ipPort = dirtyipsArray[0].split(":") // port is possible
        connection.request.ip = ipPort[0]
        // connection.request.ip = (new Ip.Address6(ip)).to4().address // IPv4 only ... for now

        // query
        Object.keys(req.params).forEach((key,index,arr) => {
            connection.request.query.set(key,req.params[key])
        })
        // post
        if(req.body){
            Object.keys(req.body).forEach((key,index,arr) => {
                connection.request.request.set(key,req.body[key])
            })
        }
        // cookies
        if(req.cookies){
            Object.keys(req.cookies).forEach((key,index,arr) => {
                connection.request.cookies.set(key,req.cookies[key])
            })
        }

        if(this.environment.get("debug")) this.transmitter.emit("log.cellpack.restify",`Request recieved: "${connection.request.host}" [${req.method}]: ${connection.request.path}`)

        this.transmitter.emit("microb.request",connection)
    }

    response(connection: Connection){
        let rawResponse = connection.response.raw
        rawResponse.status(connection.response.status)

        // headers
        let headers = connection.response.headers
        Object.keys(headers.all()).forEach((key, index, arr) => {
            if(key !== "cookies"){
                rawResponse.header(key, headers.get(key))
            }
        })

        // cookies
        let cookies = connection.response.getCookies()
        cookies.forEach((cookie: Cookie, index: number, arr: Array<Cookie>) => {
            rawResponse.setCookie(cookie.getName(), cookie.getValue(),{
                path: cookie.getPath(),
                domain: cookie.getDomain(),
                expires: (cookie.getExpires() === null ? null : (<Moment.Moment>cookie.getExpires()).toDate()),
                secure: cookie.isSecure(),
                httpOnly: cookie.isHttponly()
            })
        })
        // remove
        let removeCookies = connection.response.getRemoveCookies()
        removeCookies.forEach((cookie: Cookie, index: number, arr: Array<Cookie>) => {
            rawResponse.clearCookie(cookie.getName())
        })

        rawResponse.end(connection.response.data)
    }
}
