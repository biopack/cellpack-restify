"use strict";
const microb_1 = require("microb");
const Restify = require("restify");
class CellpackRestify extends microb_1.Cellpack {
    constructor() {
        super();
        console.log("Init CellpackRestify.");
    }
    init() {
        this.startServer();
    }
    startServer() {
        this.server = Restify.createServer();
        this.server.use(Restify.pre.sanitizePath());
        this.server.use(Restify.bodyParser({
            mapParams: false
        }));
        this.server.use(Restify.queryParser());
        this.server.use((req, res, next) => {
        });
        this.server.get(".*", (req, res, next) => { });
        this.server.post(".*", (req, res, next) => { });
        this.server.head(".*", (req, res, next) => { });
        this.server.del(".*", (req, res, next) => { });
        this.server.put(".*", (req, res, next) => { });
        this.server.opts(".*", (req, res, next) => { });
        this.server.listen(15000);
    }
}
exports.CellpackRestify = CellpackRestify;
