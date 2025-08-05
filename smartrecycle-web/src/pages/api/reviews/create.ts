// This is your "Create Review" API route.
// Final path: `pages/api/reviews/create.ts`

/*
--- HOW TO TEST ---

1. First, complete the entire lifecycle of an alert so its status is "COMPLETED".
   - Note the alert's ID.
   - Note the household user's ID (the reviewer).
   - Note the collector's ID who completed the job.
2. In Postman, create a new request:
   - Method: POST
   - URL: http://localhost:3000/api/reviews/create
3. Go to the "Body" tab, select "raw" and "JSON", and add the review details:
   {
       "rating": 5,
       "comment": "Very professional and on time. Excellent service!",
       "alertId": "[PASTE_THE_COMPLETED_ALERT_ID_HERE]",
       "reviewerId": "[PASTE_THE_HOUSEHOLD_USER_ID_HERE]"
   }
4. Send the request. You should get a 201 Created response.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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
    const { rating, comment, alertId, reviewerId } = req.body;

    // --- 1. Input Validation ---
    if (!rating || !alertId || !reviewerId) {
      return res.status(400).json({ message: 'Rating, Alert ID, and Reviewer ID are required.' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    // --- 2. Fetch the Alert for Validation ---
    const alert = await prisma.wasteAlert.findUnique({
        where: { id: alertId },
        select: {
            status: true,
            createdById: true,
            claimedById: true, // The ID of the CollectorProfile
            review: true // Check if a review already exists
        }
    });

    if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
    }

    // --- 3. Authorization and State Validation ---
    if (alert.status !== 'COMPLETED') {
        return res.status(409).json({ message: 'Cannot leave a review. The alert is not yet completed.' });
    }
    if (alert.createdById !== reviewerId) {
        return res.status(403).json({ message: 'Forbidden. You can only review alerts that you created.' });
    }
    if (alert.review) {
        return res.status(409).json({ message: 'A review for this alert has already been submitted.' });
    }
    if (!alert.claimedById) {
        // This should theoretically never happen if status is COMPLETED, but it's a good safeguard.
        return res.status(500).json({ message: 'Cannot leave review. Collector information is missing.' });
    }

    // --- 4. Create the Review ---
    const newReview = await prisma.review.create({
        data: {
            rating,
            comment,
            alertId,
            reviewerId, // The ID of the User who created the alert
            collectorId: alert.claimedById, // The ID of the CollectorProfile who claimed it
        }
    });

    // --- 5. Return Success Response ---
    return res.status(201).json({ message: 'Review submitted successfully!', review: newReview });

  } catch (error: any) {
    console.error("Create Review Error:", error);
    // Handle potential unique constraint errors if the transaction logic had a race condition
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'A review for this alert has already been submitted.' });
    }
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
