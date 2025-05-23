import { CookieCore } from "@/lib/cookie"

export const useCookie = () => {
    const getCookie = CookieCore.get('token_kanow');
    const setCookie = (name: any, token: any, date: any) => {
        return CookieCore.set(name, token, date);
    }
    const removeCookie = (key: string) => CookieCore.remove(key);
    return { getCookie, setCookie, removeCookie }
}