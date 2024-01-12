# Auth module
Instructions on how to setup auth on the app.

## 1. Create the clerk project
[Create a new Clerk project](https://dashboard.clerk.com/) and add the API key to the `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## 2. Install Clerk dependencies
Install the Clerk dependencies for Next.js and its themes:

```bash
pnpm add @clerk/nextjs @clerk/themes
```

## 3. Add the `AuthProvider` to the layout
Wrap the entire layout with the `AuthProvider` component from `@/auth/provider`:

```tsx
// app/layout.tsx

import {AuthProvider} from "@/auth/provider";

<AuthProvider>{children}</AuthProvider>
```

## 4. Secure routes on `middleware`
Create a `middleware.ts` file on the root of the project with the following content:

```ts
import {authMiddleware} from "@clerk/nextjs";

export default authMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
```
> If you want some of your pages to be public, you can pass a `publicRoute` array to `authMiddleware` with the paths of your routes.

## 5. Custom Sign in and Sign up pages
Create a `app/sign-in/[[...sign-in]]/page.tsx` file with the following content:

```tsx
import {SignIn} from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn />
  );
}
```
And a `app/sign-up/[[...sign-up]]/page.tsx` file with the following content:

```tsx
import {SignUp} from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp />
  );
}
```
Then add the following variables to your `.env.` file:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

## 6. Use Clerk components
Use the [Clerk components](https://clerk.com/docs/components/overview) wherever you need. Here you have some examples:

```tsx
// Show something only when signed in
import {SignedIn} from "@clerk/nextjs";

<SignedIn>
  Only visible when signed in
</SignedIn>

// Show something only when signed out
import {SignedOut} from "@clerk/nextjs";

<SignedOut>
  Only visible when signed out
</SignedOut>

// Show user avatar with a menu and user profile
import {UserButton} from "@clerk/nextjs";

<UserButton />
```


