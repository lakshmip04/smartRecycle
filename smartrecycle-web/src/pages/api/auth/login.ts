// This is your user login API route.
// Final path: `pages/api/auth/login.ts`

/*
--- DUMMY DATA FOR TESTING ---

You can use these JSON objects in a tool like Postman to test this endpoint.
Send a POST request to /api/auth/login with one of these bodies.
Use the same passwords you used for registration.

-- 1. LOGIN AS HOUSEHOLD USER --
{
    "email": "priya.sharma@example.com",
    "password": "password123"
}


-- 2. LOGIN AS COLLECTOR --
{
    "email": "ramesh.kumar@example.com",
    "password": "password456"
}

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, HouseholdProfile, CollectorProfile } from '@prisma/client';;
import bcrypt from 'bcryptjs';

import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, password } = req.body;

    // --- 1. Input Validation ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // --- 2. Find the User in the Database ---
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials. User not found.' });
    }

    // --- 3. Compare Passwords ---
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // --- 4. Fetch the Full User Profile ---
    // After successful login, we want to send back the user's specific profile details.
    let userProfile: HouseholdProfile | CollectorProfile | null = null;
    if (user.role === 'HOUSEHOLD') {
        userProfile = await prisma.householdProfile.findUnique({
            where: { userId: user.id }
        });
    } else if (user.role === 'COLLECTOR') {
        userProfile = await prisma.collectorProfile.findUnique({
            where: { userId: user.id }
        });
    }

    // --- 5. Return Success Response ---
    // We combine the base user info with their specific profile.
    // Remember to exclude the password from the response!
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
        message: 'Login successful!', 
        user: {
            ...userWithoutPassword,
            profile: userProfile
        } 
    });

  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
