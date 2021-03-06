"use strict";
const Restify = require("restify");
const CookieParser = require("restify-cookies");
const Promise = require("bluebird");
const microb_1 = require("microb");
class CellpackRestify extends microb_1.Cellpack {
    init() {
        this.config = this.environment.get("cellpacks")["cellpack-restify"];
        this.server = Restify.createServer();
        this.server.use(Restify.pre.sanitizePath());
        this.server.use(Restify.bodyParser({
            mapParams: false
        }));
        this.server.use(Restify.queryParser());
        this.server.use(CookieParser.parse);
        this.server.use((req, res, next) => {
            this.rawRequest.call(this, req, res, next);
        });
        this.transmitter.on("microb.response", this.response);
        this.server.get(".*", (req, res, next) => { });
        this.server.post(".*", (req, res, next) => { });
        this.server.head(".*", (req, res, next) => { });
        this.server.del(".*", (req, res, next) => { });
        this.server.put(".*", (req, res, next) => { });
        this.server.opts(".*", (req, res, next) => { });
        this.transmitter.on("microb.loaded", () => {
            this.transmitter.emit("log.cellpack.restify", `Listening on port: ${this.config.port}`);
            this.server.listen(this.config.port);
        });
        return Promise.resolve();
    }
    rawRequest(req, res, next) {
        let connection = new microb_1.Connection();
        connection.request.raw = req;
        connection.response.raw = res;
        let [hostname, port] = req.headers.host.split(':');
        connection.request.host = hostname;
        connection.request.port = port;
        connection.request.path = req.getPath();
        connection.request.protocol = req.isSecure() ? "https" : "http";
        connection.request.agent = req.headers["user-agent"] || "";
        if (req.method === "GET")
            connection.request.method = microb_1.Request.Method.GET;
        else if (req.method === "POST")
            connection.request.method = microb_1.Request.Method.POST;
        else if (req.method === "HEAD")
            connection.request.method = microb_1.Request.Method.HEAD;
        else if (req.method === "PUT")
            connection.request.method = microb_1.Request.Method.PUT;
        else if (req.method === "DELETE")
            connection.request.method = microb_1.Request.Method.DELETE;
        else if (req.method === "OPTIONS")
            connection.request.method = microb_1.Request.Method.OPTIONS;
        Object.keys(req.headers).forEach((key, index, arr) => {
            connection.request.headers.set(key.toLowerCase(), req.headers[key]);
        });
        let dirtyIps = connection.request.headers.get("x-real-ip", connection.request.headers.get("x-forwarded-for", req.connection.remoteAddress));
        let dirtyipsArray = dirtyIps.split(",");
        let ipPort = dirtyipsArray[0].split(":");
        connection.request.ip = ipPort[0];
        Object.keys(req.params).forEach((key, index, arr) => {
            connection.request.query.set(key, req.params[key]);
        });
        if (req.body) {
            Object.keys(req.body).forEach((key, index, arr) => {
                connection.request.request.set(key, req.body[key]);
            });
        }
        if (req.cookies) {
            Object.keys(req.cookies).forEach((key, index, arr) => {
                connection.request.cookies.set(key, req.cookies[key]);
            });
        }
        if (this.environment.get("debug"))
            this.transmitter.emit("log.cellpack.restify", `Request recieved: "${connection.request.host}" [${req.method}]: ${connection.request.path}`);
        this.transmitter.emit("microb.request", connection);
    }
    response(connection) {
        let rawResponse = connection.response.raw;
        rawResponse.status(connection.response.status);
        let headers = connection.response.headers;
        Object.keys(headers.all()).forEach((key, index, arr) => {
            if (key !== "cookies") {
                rawResponse.header(key, headers.get(key));
            }
        });
        let cookies = connection.response.getCookies();
        cookies.forEach((cookie, index, arr) => {
            rawResponse.setCookie(cookie.getName(), cookie.getValue(), {
                path: cookie.getPath(),
                domain: cookie.getDomain(),
                expires: (cookie.getExpires() === null ? null : cookie.getExpires().toDate()),
                secure: cookie.isSecure(),
                httpOnly: cookie.isHttponly()
            });
        });
        let removeCookies = connection.response.getRemoveCookies();
        removeCookies.forEach((cookie, index, arr) => {
            rawResponse.clearCookie(cookie.getName());
        });
        rawResponse.end(connection.response.data);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CellpackRestify;
