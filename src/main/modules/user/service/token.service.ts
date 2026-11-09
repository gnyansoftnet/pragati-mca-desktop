import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { injectable, singleton } from "tsyringe";

const ACCESS_SECRET: Secret =
    process.env.ACCESS_SECRET || "access_secret";

const REFRESH_SECRET: Secret =
    process.env.REFRESH_SECRET || "refresh_secret";

@injectable()
@singleton()
export class TokenService {
    generateAccessToken(payload: object): string {
        const options: SignOptions = {
            expiresIn: process.env.ACCESS_EXPIRES as SignOptions["expiresIn"]
        };

        return jwt.sign(
            payload,
            ACCESS_SECRET,
            options
        );
    }

    generateRefreshToken(payload: object): string {
        const options: SignOptions = {
            expiresIn: process.env.REFRESH_EXPIRES as SignOptions["expiresIn"]
        };

        return jwt.sign(
            payload,
            REFRESH_SECRET,
            options
        );
    }

    verifyAccessToken(token: string): string | JwtPayload {
        return jwt.verify(token, ACCESS_SECRET);
    }

    verifyRefreshToken(token: string): string | JwtPayload {
        return jwt.verify(token, REFRESH_SECRET);
    }
}