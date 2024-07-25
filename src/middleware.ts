import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
import getOrCreateDb from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storage.collection'
// This function can be marked `async` if using `await` inside
export async function  middleware(request: NextRequest) {
    await Promise.all([
        getOrCreateDb(),
        getOrCreateStorage()
    ])
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
    /* The middleware will not run on the places which are mentioned in the matcher field
        expect this it will run everywhere,
        where we do not want to run the middleware function (And the matcher field can be an array)
        - api
        - _next/image
        - _next/static
        - favicon.ico
    */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
}