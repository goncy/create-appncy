# Auth0 module
Instructions on how to setup auth on the app.

You can mostly follow up [this interactive guide](https://auth0.com/docs/quickstart/webapp/nextjs/interactive) to walk you through.

## 1. Create an Auth0 project
[Create a new Auth0 project](https://manage.auth0.com/) and set the Callback URLs, Logout URLs and Allowed Web Origins:

```bash
# Callback URLs
http://localhost:3000/api/auth/callback

# Logout URLs
http://localhost:3000

# Allowed Web Origins
http://localhost:3000
```

## 2. Install the Auth0 dependencies
Install the Auth0 dependencies for Next.js:

```bash
pnpm add @auth0/nextjs-auth0
```

## 3. Configure environment variables
Add the following variables to your `.env.local` file:

```bash
AUTH0_SECRET="yourownsecret"
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='<get this from Auth0>'
AUTH0_CLIENT_ID='<get this from Auth0>'
AUTH0_CLIENT_SECRET='<get this from Auth0>'
```

## 4. Create a dynamic route handler
Create a `src/app/api/auth/[auth0]/route.ts` file with the following content:

```ts
import {handleAuth} from "@auth0/nextjs-auth0";

export const GET = handleAuth() as () => Promise<void>;
```

## 5. Add the `UserProvider` component to the layout
Wrap the root layout with the `UserProvider` component from `@auth0/nextjs-auth0/client`. This will let you access the session information withing client components:

```tsx
// app/layout.tsx

import {UserProvider} from "@/auth/provider";

<UserProvider>{children}</UserProvider>
```

## 6. Add a login and logout link in the app and access the sesion information
Add a link to login and logout in the app to let users handle their session:

```tsx
// app/layout.tsx

export default async function RootLayout({children}) {
  const session = await getSession();

  return (
    ...
    <UserProvider>
      <header>
        {session?.user ? (
          <Link href="/api/auth/logout">Cerrar sesión</Link>
        ) : (
          <Link href="/api/auth/login">Iniciar sesión</Link>
        )}
      </header>
      {session?.user && <h1>Hi {session.user.name}!</h1>}
    </UserProvider>
    ...
  );
}
```
