import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { KEY_COOKIES } from "@/constants/Cookie";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(KEY_COOKIES.WEBSITE);

    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/" && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login"],
};
