// Type definitions for restify-cookies
// Project: https://www.npmjs.org/package/restify-cookies
// Definitions by: scippio <https://github.com/scippio/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped



// <reference path="../../node_modules/@types/restify/index.d.ts" />

declare namespace Restify {
    // declare module "restify" {
        // import * as Restify from 'restify'

        interface CookieOptionsInterface {
            path?: string,
            domain?: string,
            maxAge?: number,
            secure?: boolean,
            httpOnly?: boolean
        }

        export interface Response {
            cookies: any;
            setCookie: (key: string, value: any, cookieOptions?: CookieOptionsInterface) => void;
            clearCookie: (key: string) => void;
        }
    // }
}

export const parse: (req?: any, res?: any, next?: any) => void;
