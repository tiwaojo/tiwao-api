import { JwtPayload, verify } from "jsonwebtoken";
import { GraphQLContext, prisma } from "./context";
import { hash } from "bcryptjs";
import { GraphQLError } from "graphql";

export const APP_SECRET = process.env.APP_SECRET as string;
export const HASHED_APP_SECRET = async () => await hash(APP_SECRET, 10);

interface Token {
  userId: string;
  email: string;
}

// get the user id and email from the token
// if the token is valid, return the user so it may be added to the context
export async function verifyToken(ctx: GraphQLContext) {
  const authToken = ctx.req?.headers["authorization"];

  if (authToken) {
    const verifiedToken: Token = {
      userId: "",
      email: "",
    };
    const token = authToken.replace("Bearer ", "");
    let res = "";
    let errCode = 403;
    verify(token, APP_SECRET, { maxAge: "30d" }, (err, decoded) => {
      // if the token is expired/invalid, this callback is called with an error and will return null
      // if the token is valid, this callback is called with the decoded payload

      if (err) {
        res = `Auth error: ${err.message}`;
        throw new GraphQLError(res, {
          extensions: {
            code: "UNAUTHENTICATED",
            http: { status: 403 },
          },
        });
      } else {
        verifiedToken.userId = (decoded as JwtPayload)["userId"];
        verifiedToken.email = (decoded as JwtPayload)["email"];
      }
    });

    // Note: you can also use the userId in the token to fetch the user from the database using prisma along with performing other desired computations
    const userCount = await prisma.user.count({
      where: {
        id: verifiedToken.userId,
        email: verifiedToken.email,
        role: "PROMETHUS"
      },
    });

    if (userCount) {
      errCode = 200;
    }

    return errCode === 200 && verifiedToken.userId;
  }
}
