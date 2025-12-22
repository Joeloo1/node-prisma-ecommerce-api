import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { prisma } from "../config/database";
import { createAddressSchema, updateAddressSchema } from "../Schema/addressSchema";  

// create Address 
 export const createAddress = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const  addressData = createAddressSchema.parse(req.body)
  const userId = req.user!.id;

  const Address = await prisma.address.create({
    data: {
      ...addressData,
      userId,
    }
  }) 

  res.status(201).json({
    status: 'success',
    data : {
      Address
    }
  })
}); 

// update Address 
 export const updateAddress = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const addressId = req.params.id;
    const userId = req.user!.id;

   const updateData = updateAddressSchema.parse(req.body);

  const address = await prisma.address.findUnique({
    where: { id : addressId }
  });

  if (!addressId || address?.userId !== userId ) {
    return next(new AppError('Address not found or unauthorized', 404))
  };

  const updateAddress = await prisma.address.update({
    where: { id: addressId },
    data:  updateData ,
  });

  res.status(200).json({
    status: 'success',
    data: {
      address: updateAddress
    }
  })
});

// Get All Address
export const getAllAddresses = catchAsync(async( req: Request, res: Response, next: NextFunction) => {
  const address = await prisma.address.findMany({
    where: { userId : req.user!.id }, 

  });

  res.status(200).json({
    status: 'success',
    result: address.length,
    data: {
      address
    }
  })
}); 

// Get single Address
export const getAddress = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const address = await prisma.address.findUnique({
    where: { id: req.params.id }
  });

  if (!address || address.userId !== req.user!.id ) {
    return next(new AppError('Address not found', 404))
  }

  res.status(200).json({
    status: 'success', 
    data: {
      address
    }
  })
});

// Delete Address 
 export const deleteAddress = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const address = await prisma.address.findUnique({
    where: { id: req.params.id }
  });

  if (!address || address.userId !== req.user!.id) {
    return next(new AppError('Address not found', 404))
  };

  await prisma.address.delete({ 
    where: { id: req.params.id }
  });

  res.status(200).json({
    status: 'success',
    data: null
  })
})
