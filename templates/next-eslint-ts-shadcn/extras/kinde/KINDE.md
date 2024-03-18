# Kinde Auth module
Instructions on how to setup Kinde auth on the app.

## 1. Create the Kinde project
[Create a new Kinde project](https://kinde.com/).

## 2. Install Kinde dependency
Install the Kinde dependency for Next.js:

```bash
pnpm add @kinde-oss/kinde-auth-nextjs
```

## 3. Copy all your Kinde environment variables
Once you created the project you should see below all the environment variables needed for the project. Copy all of them and add them to your `.env.local` file.

```bash
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=
```

## 4. Use Kinde components and helpers
Kinde has several helpers to get the user session and permissions. Also, it has some components to handle the login and register links.

### Components:
```tsx
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";

...

<LoginLink>Sign in</LoginLink>
<RegisterLink>Sign up</RegisterLink>
```

### Server Components helper:
```ts
const {
  getAccessToken,
  getBooleanFlag,
  getFlag,
  getIdToken,
  getIntegerFlag,
  getOrganization,
  getPermission,
  getPermissions,
  getStringFlag,
  getUser,
  getUserOrganizations,
  isAuthenticated
} = getKindeServerSession();

console.log(await getAccessToken());
console.log(await getBooleanFlag("bflag", false));
console.log(await getFlag("flag", "x", "s"));
console.log(await getIntegerFlag("iflag", 99));
console.log(await getOrganization());
console.log(await getPermission("eat:chips"));
console.log(await getPermissions());
console.log(await getStringFlag("sflag", "test"));
console.log(await getUser());
console.log(await getUserOrganizations());
console.log(await isAuthenticated());
```

### Client Components helper:
```ts
const {
  permissions,
  isLoading,
  user,
  accessToken,
  organization,
  userOrganizations,
  getPermission,
  getBooleanFlag,
  getIntegerFlag,
  getFlag,
  getStringFlag,
  getClaim,
  getAccessToken,
  getToken,
  getIdToken,
  getOrganization,
  getPermissions,
  getUserOrganizations
} = useKindeBrowserClient();

console.log(getPermission("eat:chips"));
console.log(getBooleanFlag("flag", false));
console.log(getIntegerFlag("eat:chips", 1));
console.log(getStringFlag("eat:chips", "ds"));
console.log(getFlag("eat:chips", false, "b"));

console.log("accessToken", accessToken);
console.log(getClaim("aud"));
```

### Middleware:
```ts
import {withAuth} from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req) {
    return withAuth(req);
}

export const config = {
    matcher: ["/admin"]
};
```
