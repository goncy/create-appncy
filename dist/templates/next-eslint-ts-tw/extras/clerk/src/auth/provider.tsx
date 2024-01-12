import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function AuthProvider({ children }: { children: React.ReactNode }) {

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          footer: "m-auto",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
