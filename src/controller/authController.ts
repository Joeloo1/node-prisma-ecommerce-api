import { Request, Response, NextFunction  } from "express";
import JWT from "jsonwebtoken";
import crypto from "crypto";

import catchAsync from "../utils/catchAsync";
import { loginSchema,
         signupSchema } from "../Schema/userSchema";
import { hashPassword, 
         comparePassword, 
         changePasswordAfter,
         createPasswordResetToken } from "../utils/password";
import AppError from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { prisma } from "./../config/database"
import { User } from "@prisma/client";
import sendMail from "../utils/email";

interface DecodedToken {
  id: string;
  iat: number;
}


declare global {
  namespace Express {
    interface Request {
      user?: User; 
    }
  }
}


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

// Protect routes
export const Protect = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('You are no longer logged in, Please log in again', 401))
  }
  // verify token 
 const decoded = JWT.verify(
    token,
    process.env.JWT_SECRET as string
  ) as DecodedToken;
  // check if user still exists
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id }
  })
  
  if (!currentUser) {
    return next(new AppError('User belonging to this token no longer exists', 401))
  }

  // check if user changed password after token was issued

   if (changePasswordAfter(currentUser.passwordChangedAt, decoded.iat)) {
      return next(
    new AppError("You recently changed password, please log in again", 401));
  }
   req.user = currentUser;
  next()
}) 

// restrict to only admin 
 export const restrictTo = (...roles: string[]) => {
  return(req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          'You must be logged in to perform this action',
          401
        )
      );
    }
    // Check if user has required role
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  }
}

// forget password 
 export const forgetPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
   const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email', 400))
  }

  const user = await prisma.user.findUnique({
    where: { email }, 
  });

  if (!user) {
    return next(new AppError('There is no user with the email', 404))
  };

     const { passwordResetToken,
             resetToken,
             resetTokenExpiry,} = createPasswordResetToken(); 

  // save the hashed token to database 
  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    }
  })

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${passwordResetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;
  
  try{
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  }catch (err) {
    await prisma.user.update({
       where: {email},
        data: {
           resetToken: null,
           resetTokenExpiry: null
        }
    })  

    return next(
      new AppError(
        'There wan an error sending the email, Please try again later',
        500
      )
    )
  }
});

// reset password
 export  const resetPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide password and passwordConfirm',
        400
      )
    )
  }
  if (password !== passwordConfirm) {
    return next(new AppError(
      'Passwords do not match',400
    ))
  }

  // get user based on token 
   const hashedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');

  const user = await prisma.user.findFirst({
    where : {
      resetToken : hashedToken,
      resetTokenExpiry: {gt: new Date()}
    }
  })
  
  if (!user) {
    return next(
      new AppError('Token is Invalid or has expire',400)
    )
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: {id: user.id},
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      resetToken: null,
      resetTokenExpiry: null,
    }
  })
    
  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfuly,'
  })
})

// update password 
export const updatePassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const  {currentPassword, newPassword, passwordConfirm} = req.body;

    if (!currentPassword || !newPassword || !passwordConfirm) {
      return next(new AppError("All fields are required", 400));
    }

    if (newPassword !== passwordConfirm) {
      return next(new AppError("New passwords do not match", 400));
    }

    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    // 1. Get the user from DB
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return next(new AppError("User not found", 404));

    // 2. Check if current password is correct
    const isValidPass = await comparePassword(currentPassword, user.password);

    if (!isValidPass) {
      return next(new AppError("Your current password is incorrect", 401));
    }
    
    // 3. Hash and update new password
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      },
    });

    // 4. Force the user to re-login
    res.status(200).json({
      status: "success",
      message: "Password updated successfully. Please log in again.",
    });
})
