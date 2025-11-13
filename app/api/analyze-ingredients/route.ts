import { type NextRequest, NextResponse } from "next/server"

// Fallback endpoint - returns empty array as image analysis moved to client-side
// This prevents errors while maintaining the API structure for future enhancements

export async function POST(request: NextRequest) {
  try {
    // Client-side processing now handles ingredient detection
    // Return success to avoid breaking existing error handling
    return NextResponse.json({ ingredients: [] })
  } catch {
    return NextResponse.json({ ingredients: [] }, { status: 200 })
  }
}
