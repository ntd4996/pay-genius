import { connect } from '@/utils/config/dbConfig';
import User from '@/utils/models/auth';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcryptjs from 'bcryptjs';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        try {
          await connect();

          const user = await User.findOne({ email });
          if (!user) {
            return null;
          }

          const passwordMatch = await bcryptjs.compare(password, user.password);
          if (!passwordMatch) {
            return null;
          }
          return user;
        } catch (error: any) {
          console.log('🚀 ~ authorize ~ error:', error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // authorization: {
      //   params: {
      //     prompt: 'consent',
      //     access_type: 'offline',
      //     response_type: 'code',
      //   },
      // },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account.provider === 'google') {
        try {
          const { name, email } = user;
          await connect();
          const ifUserExists = await User.findOne({ email });
          if (ifUserExists) {
            return user;
          }

          const newUser = new User({
            name,
            email,
          });

          const res = await newUser.save();

          if (res.status === 200 || res.status === 201) {
            return user;
          }
        } catch (error: any) {
          console.log('🚀 ~ signIn ~ error:', error);
        }
      }
      return user;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
