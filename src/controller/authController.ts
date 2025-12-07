import { Request, Response, NextFunction  } from "express";
//import { PrismaClient } from "@prisma/client";

import catchAsync from "../utils/catchAsync";
import { signupSchema } from "../Schema/userSchema";
import { hashPassword } from "../utils/password";
import AppError from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { prisma } from "./../config/database"

//const prisma = new PrismaClient();

//  Signup User 
export const signup = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const user = signupSchema.parse(req.body);

    const exitingUser = await prisma.user.findUnique({
        where: { email: user.email}
    })
    if (exitingUser) {
        return next(new AppError('User with this email already exists', 400))
    }

    user.password = await hashPassword(user.password);

    const newUser = await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            password: user.password,
            phoneNumber: user.phoneNumber,
            roles:user.roles,
            profileImage: user.profileImage
        }
    });
    const token = signToken({ id: newUser.id});
 
    const sanitizedUser = { 
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
        phoneNumber: newUser.phoneNumber,
        profileImage: newUser.profileImage,
        createAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
    }
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: sanitizedUser 
       }
    })
})