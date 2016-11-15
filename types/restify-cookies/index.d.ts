import "restify"
declare module "restify" {
    interface CookieOptionsInterface {
        path?: string,
        domain?: string,
        maxAge?: number,
        secure?: boolean,
        httpOnly?: boolean
    }

    interface Request {
        readonly cookies: any
    }

    interface Response {
        setCookie: (key: string, value: any, cookieOptions?: CookieOptionsInterface) => void
        clearCookie: (key: string) => void
    }
}

export const parse: (req?: any, res?: any, next?: any) => void
