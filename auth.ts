import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Auth0Provider from "next-auth/providers/auth0";


declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string,
      sub: string,
      name: string,
      email: string,
      picture: string,
      image: string,
      user_id: string,
    } & DefaultSession['user'],
    accessToken: any,
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental // will be removed in future
} = NextAuth({
  providers: [
    Auth0Provider({
      clientId: "***REMOVED***",
      clientSecret: "***REMOVED***",
      issuer: "***REMOVED***"
    })
  ],
  callbacks: {
    jwt: async ({ token, profile, account }) => {
      if (profile) {
        token.id = profile.id
        token.image = profile.picture
      }
      if (account?.access_token){
        token.accessToken = account.access_token
      }
      return token
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken
      return session
    },
    authorized({ auth }) {
      // console.log("is user auth?",auth);
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
