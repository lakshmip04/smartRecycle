// This is your "Claim Waste Alert" API route.
// Final path: `pages/api/alerts/[alertId]/claim.ts`

/*
--- HOW TO TEST ---

1. First, use the GET /api/alerts endpoint to find the ID of a PENDING alert.
2. Register/Login a COLLECTOR and get their user ID.
3. In Postman, create a new request:
   - Method: PUT
   - URL: http://localhost:3000/api/alerts/[PASTE_ALERT_ID_HERE]/claim
4. Go to the "Body" tab, select "raw" and "JSON", and add the collector's ID:
   {
       "collectorId": "[PASTE_COLLECTOR_USER_ID_HERE]"
   }
5. Send the request. You should get a 200 OK with the updated alert.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

import prisma from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // --- 1. Get IDs from request ---
    const { alertId } = req.query; // Get alertId from the URL (e.g., /api/alerts/abc/claim)
    const { collectorId } = req.body; // Get collectorId from the request body

    if (!alertId || !collectorId) {
      return res.status(400).json({ message: 'Alert ID and Collector ID are required.' });
    }

    // --- 2. Validate the Collector ---
    const collectorProfile = await prisma.collectorProfile.findUnique({
        where: { userId: collectorId },
        select: { id: true, name: true } // Select name for the status log
    });

    if (!collectorProfile) {
        return res.status(404).json({ message: 'Collector profile not found.' });
    }

    // --- 3. Update the Alert within a Transaction ---
    // A transaction ensures this whole operation succeeds or fails together.
    // This is crucial to prevent race conditions where two collectors might claim the same alert.
    const updatedAlert = await prisma.$transaction(async (tx) => {
      // Find the alert and lock it for the transaction
      const alert = await tx.wasteAlert.findUnique({
        where: { id: alertId as string },
      });

      // Check if the alert exists and is still pending
      if (!alert) {
        throw new Error('Alert not found.');
      }
      if (alert.status !== 'PENDING') {
        throw new Error('This alert has already been claimed or cancelled.');
      }

      // Update the alert status and assign the collector
      const claimedAlert = await tx.wasteAlert.update({
        where: { id: alertId as string },
        data: {
          status: 'CLAIMED',
          claimedById: collectorProfile.id, // Assign the collector's PROFILE id
        },
      });

      // Create a new status log for this action
      await tx.statusLog.create({
        data: {
          alertId: claimedAlert.id,
          status: 'CLAIMED',
          notes: `Alert claimed by collector: ${collectorProfile.name}.`,
        },
      });

      return claimedAlert;
    });

    // --- 4. Return Success Response ---
    return res.status(200).json({ message: 'Alert claimed successfully!', alert: updatedAlert });

  } catch (error: any) {
    console.error("Claim Alert Error:", error);
    // Handle specific errors from the transaction
    if (error.message.includes('Alert not found') || error.message.includes('already been claimed')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
