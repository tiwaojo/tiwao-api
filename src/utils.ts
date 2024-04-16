import { verify } from "jsonwebtoken";
import { GraphQLContext, prisma } from "./context";
import { hash } from "bcryptjs";
import { GraphQLError } from "graphql";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const APP_SECRET = process.env.APP_SECRET || "appsecret321";
export const HASHED_APP_SECRET = async () => await hash(APP_SECRET, 10);

interface Token {
  userId: string;
  email: string;
}

// get the user id and email from the token
// if the token is valid, return the user so it may be added to the context
export async function verifyToken(ctx: GraphQLContext) {

  const authToken = ctx.req?.headers.authorization ;
  
  if (authToken) {
    const token = authToken.replace("Bearer ", "");
    const verifiedToken = verify(token, APP_SECRET) as Token;

   // Note: you can also use the userId in the token to fetch the user from the database using prisma
    console.log("Token verified: ", verifiedToken);

    const user = prisma.user.count({
      where: {
        id: verifiedToken.userId,
      },
    });

    if (!user) {
      // throwing a `GraphQLError` here allows us to specify an HTTP status code,
      // standard `Error`s will have a 500 status code by default
      throw new GraphQLError("User is not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
          http: { status: 401 },
        },
      });
    }

    return verifiedToken && String(verifiedToken.userId)
  }
}
