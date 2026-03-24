import { NextResponse } from 'next/server'

const BE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function GET() {
    try {
        const res = await fetch(`${BE_URL}/csrf-token`, {
            credentials: 'include',
        })
        const data = await res.json()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ success: false, token: null }, { status: 500 })
    }
}