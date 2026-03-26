import { NextRequest, NextResponse } from 'next/server'

const BE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/')
    const url = new URL(request.url)
    const targetUrl = `${BE_URL}/${path}${url.search}`

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        // Forward semua header kecuali host
        if (key !== 'host') headers[key] = value
    })

    // Forward cookie dari browser ke BE
    const cookieHeader = request.headers.get('cookie') || ''
    if (cookieHeader) headers['cookie'] = cookieHeader

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()

    const res = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
    })

    const responseHeaders = new Headers()
    res.headers.forEach((value, key) => {
        if (key === 'set-cookie' || key === 'content-type') {
            responseHeaders.set(key, value)
        }
    })

    return new NextResponse(res.body, {
        status: res.status,
        headers: responseHeaders,
    })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler