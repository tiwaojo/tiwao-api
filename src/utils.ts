import { verify } from "jsonwebtoken";
import { GraphQLContext, prisma } from "./context";
import { hash } from "bcryptjs";

export const APP_SECRET = process.env.APP_SECRET || "appsecret321";
export const HASHED_APP_SECRET = async () => await hash(APP_SECRET, 10);

interface Token {
  userId: string;
  email: string;
}

// get the user id and email from the token
// if the token is valid, return the user so it may be added to the context
export async function verifyToken(ctx: GraphQLContext) {
  const authToken = ctx.req?.headers.authorization;
  // const expiry = ctx.req?.headers.cookie["token_expiry"];

  if (authToken) {
    const token = authToken.replace("Bearer ", "");
    const verifiedToken = verify(token, APP_SECRET) as Token;

    // Note: you can also use the userId in the token to fetch the user from the database using prisma along with performing other desired computations
    // console.log("Token verified: ", verifiedToken);

    if (!verifiedToken) {
      console.log("Token not verified")
      return null;
    }

    const user_count = await prisma.user.count({
      where: {
        id: verifiedToken.userId,
      },
    });


    if (
      user_count
      // || expiry < Date.now()
    ) {
      return String(verifiedToken.userId);
    } 
    
  }
}
