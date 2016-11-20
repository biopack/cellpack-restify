import { Cellpack } from "microb";
import * as Restify from "restify";
export default class CellpackRestify extends Cellpack {
    server: Restify.Server;
    init(): void;
    private rawRequest(req, res, next);
    private response(connection);
}
