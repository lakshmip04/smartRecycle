import { PrismaClient } from '@prisma/client';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  // In a real app, you'd verify that the logged-in user matches the userId
  
  try {
    const { role, profileData } = req.body;

    let updatedProfile;

    if (role === 'HOUSEHOLD') {
      updatedProfile = await prisma.householdProfile.update({
        where: { userId: userId },
        data: {
          name: profileData.name,
          address: profileData.address,
        },
      });
    } else if (role === 'COLLECTOR') {
      updatedProfile = await prisma.collectorProfile.update({
        where: { userId: userId },
        data: {
          name: profileData.name,
          address: profileData.address,
          vehicleDetails: profileData.vehicleDetails,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid user role.' });
    }

    // Also update the user's phone number on the main User model
    await prisma.user.update({
        where: { id: userId },
        data: { phone: profileData.phone }
    });

    res.status(200).json({ message: 'Profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
}