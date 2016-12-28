/// <reference types="bluebird" />
import * as Restify from "restify";
import * as Promise from "bluebird";
import { Cellpack, Connection } from "microb";
export default class CellpackRestify extends Cellpack {
    server: Restify.Server;
    init(): Promise<void>;
    private rawRequest(req, res, next);
    response(connection: Connection): void;
}
