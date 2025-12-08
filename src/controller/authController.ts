import { Request, Response, NextFunction  } from "express";
//import { PrismaClient } from "@prisma/client";

import catchAsync from "../utils/catchAsync";
import { loginSchema, signupSchema } from "../Schema/userSchema";
import { hashPassword, comparePassword } from "../utils/password";
import AppError from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { prisma } from "./../config/database"
import { sign } from "crypto";

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

// login  user
export const login = catchAsync(async(req: Request,res: Response, next: NextFunction) => {
  const {email, password} = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({where: { email }})

  if (!user) {
    return next(new AppError('Incorrect email and password', 401))
  }

  const isPasswordCorrect = await comparePassword(password, user.password)

  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect email and password', 401))
  }

  const token = signToken({ id: user.id}) 

  const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
      active: user.active,
  }

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: sanitizedUser
    }
  })
})
