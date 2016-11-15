import "restify";
declare module "restify" {
    interface CookieOptionsInterface {
        path?: string;
        domain?: string;
        maxAge?: number;
        secure?: boolean;
        httpOnly?: boolean;
    }
    interface Response {
        cookies: any;
        setCookie: (key: string, value: any, cookieOptions?: CookieOptionsInterface) => void;
        clearCookie: (key: string) => void;
    }
}

declare module "restify-cookies" {
    export const parse: (req?: any, res?: any, next?: any) => void;
}
