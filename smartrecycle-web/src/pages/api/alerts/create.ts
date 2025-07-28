// This is your "Create Waste Alert" API route.
// Final path: `pages/api/alerts/create.ts`

/*
--- DUMMY DATA FOR TESTING ---

You can use this JSON object in Postman to test this endpoint.
Send a POST request to /api/alerts/create.

NOTE: For this test, you first need to register/login a HOUSEHOLD user 
(like priya.sharma@example.com) and get their user ID from the database or the login response.

{
    "wasteType": "E_WASTE",
    "description": "Old monitor and a broken keyboard.",
    "imageUrl": "https://example.com/images/my_e_waste.jpg",
    "weightEstimate": 5.5,
    "pickupAddress": "123, 4th Main, Indiranagar, Bengaluru, Karnataka 560038",
    "pickupLatitude": 12.97194,
    "pickupLongitude": 77.6411,
    "pickupTimeSlot": "9am-12pm",
    "createdById": "clz..." // <-- PASTE THE USER ID OF THE LOGGED-IN HOUSEHOLD USER HERE
}

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, WasteType } from '@prisma/client';

const prisma = new PrismaClient();

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
      wasteType,
      description,
      imageUrl,
      weightEstimate,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      createdById,
      pickupTimeSlot, // ADDED: Get the time slot from the request
    } = req.body;

    // --- 1. Input Validation ---
    if (!wasteType || !pickupAddress || !pickupLatitude || !pickupLongitude || !createdById || !pickupTimeSlot) {
      return res.status(400).json({ message: 'Missing required fields: wasteType, pickupAddress, coordinates, time slot, and createdById are required.' });
    }

    // --- 2. Verify the User ---
    const user = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!user || user.role !== 'HOUSEHOLD') {
      return res.status(403).json({ message: 'Forbidden. Only household users can create alerts.' });
    }

    // --- 3. Create the Alert and Initial Status Log in a Transaction ---
    const newAlert = await prisma.$transaction(async (tx) => {
      // Create the main alert record
      const alert = await tx.wasteAlert.create({
        data: {
          wasteType: wasteType as WasteType,
          description,
          imageUrl,
          weightEstimate,
          pickupAddress,
          pickupLatitude,
          pickupLongitude,
          createdById: user.id,
          pickupTimeSlot, // ADDED: Save the time slot to the database
        },
      });

      // Create the very first status log entry for this alert
      await tx.statusLog.create({
        data: {
          alertId: alert.id,
          status: 'PENDING',
          notes: 'Alert created by user.',
        },
      });

      return alert;
    });

    // --- 4. Return Success Response ---
    return res.status(201).json({ message: 'Alert created successfully!', alert: newAlert });

  } catch (error: any) {
    console.error("Create Alert Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
