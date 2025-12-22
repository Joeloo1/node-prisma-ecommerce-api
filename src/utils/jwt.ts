import jwt from 'jsonwebtoken';

const expires = process.env.JWT_EXPIRES_IN || '90d';
const options = {
    expiresIn: expires
} as jwt.SignOptions;

export const signToken = (payload: object): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, options)
}
