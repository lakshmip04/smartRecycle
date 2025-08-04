// This is your user registration API route.
// Final path: `pages/api/auth/register.ts`

/*
--- DUMMY DATA FOR TESTING ---

You can use these JSON objects in a tool like Postman to test this endpoint.
Send a POST request to /api/auth/register with one of these bodies.

-- 1. DUMMY HOUSEHOLD USER --
{
    "name": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "HOUSEHOLD",
    "address": "123, 4th Main, Indiranagar, Bengaluru, Karnataka 560038",
    "dateOfBirth": "1990-05-15"
}


-- 2. DUMMY COLLECTOR --
{
    "name": "Ramesh Kumar",
    "email": "ramesh.kumar@example.com",
    "password": "password456",
    "phone": "8765432109",
    "role": "COLLECTOR",
    "address": "56, 7th Cross, Jayanagar, Bengaluru, Karnataka 560041",
    "latitude": 12.9293,
    "longitude": 77.5826,
    "identityDocumentUrl": "https://example.com/ids/ramesh_kumar_id.pdf",
    "vehicleDetails": "Tata Ace - KA-05-MN-6789",
    "acceptedWasteTypes": ["E_WASTE", "RECYCLABLE", "GENERAL"]
}

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, WasteType } from '@prisma/client';
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
    const { 
        email, password, phone, name, address, role, 
        // Household specific
        dateOfBirth,
        // Collector specific
        identityDocumentUrl, acceptedWasteTypes, vehicleDetails, latitude, longitude
    } = req.body;

    // --- 1. Input Validation ---
    if (!email || !password || !phone || !name || !role || !address) {
      return res.status(400).json({ message: 'Missing required fields. Email, password, phone, name, role, and address are required for all users.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    
    if (role !== 'HOUSEHOLD' && role !== 'COLLECTOR') {
        return res.status(400).json({ message: 'Invalid role specified. Must be HOUSEHOLD or COLLECTOR.' });
    }

    // --- 2. Check for Existing User ---
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
        return res.status(409).json({ message: 'User with this phone number already exists.' });
    }

    // --- 3. Hash the Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 4. Create the User and Profile in a Transaction ---
    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                phone,
                role,
            }
        });

        if (role === 'HOUSEHOLD') {
            if (!dateOfBirth) {
                throw new Error('Household users must provide dateOfBirth.');
            }
            await tx.householdProfile.create({
                data: {
                    userId: user.id,
                    name,
                    dateOfBirth: new Date(dateOfBirth),
                    address,
                }
            });
        } else if (role === 'COLLECTOR') {
            // For collectors, we now require these fields for a complete profile from the start.
            if (!identityDocumentUrl || !Array.isArray(acceptedWasteTypes) || acceptedWasteTypes.length === 0) {
                throw new Error('Collectors must provide an identity document URL and specify at least one accepted waste type.');
            }

            await tx.collectorProfile.create({
                data: {
                    userId: user.id,
                    name,
                    address,
                    latitude,
                    longitude,
                    identityDocumentUrl,
                    vehicleDetails,
                    acceptedWasteTypes: acceptedWasteTypes as WasteType[], // Casting to the enum type
                }
            });
        }
        
        return user;
    });

    // --- 5. Return Success Response ---
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ message: 'User created successfully!', user: userWithoutPassword });

  } catch (error: any) {
    console.error("Registration Error:", error);
    // Provide more specific error messages to the client
    if (error.message.includes('Household users') || error.message.includes('Collectors must')) {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
