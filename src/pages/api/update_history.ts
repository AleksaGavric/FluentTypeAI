import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import clientPromise from '../../../lib/mongodb';
import authOptions from './auth/[...nextauth]';

const isTimestampValid = (timestamp: string) => {
  const requestTime = new Date(parseInt(timestamp, 10));
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - requestTime.getTime();

  return Math.abs(timeDifference) < 1 * 60 * 1000;
};

const updateHistory = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  const userEmail = (session as { user: { email: string } })?.user?.email;

  if (!userEmail) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (req.method === 'POST') {
    const timestamp = req.headers['x-timestamp'] || req.body.timestamp;

    if (!timestamp || !isTimestampValid(timestamp)) {
      res.status(400).json({ message: 'Invalid or missing timestamp.' });
      return;
    }

    try {
      const { wpm }: { wpm: number } = req.body;
      const { mistakes }: { mistakes: Record<string, number> } = req.body;
      const { accuracy }: { accuracy: number } = req.body;
      const { totalSessionMistakes }: { totalSessionMistakes: number } =
        req.body;

      if (typeof wpm !== 'number' || wpm < 0 || wpm > 250) {
        res.status(400).json({ message: 'Invalid wpm value' });
        return;
      }

      const client = await clientPromise;
      const db = client.db('fluenttype');
      const usersCollection = db.collection('users');

      const typingData: {
        time: Date;
        wpm: number;
        accuracy: number;
        totalSessionMistakes: number;
      } = {
        time: new Date(),
        wpm,
        accuracy,
        totalSessionMistakes,
      };

      const userDoc = await usersCollection.findOne({ email: userEmail });
      const existingMistakes = userDoc?.mistakes || {};

      const mergedMistakes = { ...existingMistakes };
      Object.entries(mistakes).forEach(([key, value]) => {
        if (mergedMistakes[key]) {
          mergedMistakes[key] += value;
        } else {
          mergedMistakes[key] = value;
        }
      });

      const typingHistory = userDoc?.typingHistory || [];
      const lastTypingSession = typingHistory[typingHistory.length - 1];
      let streak = userDoc?.streak || 0;
      const lastTypingDate = lastTypingSession
        ? new Date(lastTypingSession.time)
        : null;
      const currentDate = new Date();
      const dateDifference =
        currentDate.getDate() - (lastTypingDate ? lastTypingDate.getDate() : 0);

      if (dateDifference === 1) {
        streak += 1;
      } else if (dateDifference > 1) {
        streak = 1;
      }

      const topMistakes: Record<string, number> = Object.entries(mergedMistakes)
        .sort(
          (a: [string, unknown], b: [string, unknown]) =>
            (b[1] as number) - (a[1] as number)
        )
        .slice(0, 8)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      await usersCollection.updateOne(
        { email: userEmail },
        {
          $set: { mistakes: topMistakes, streak },
          $push: {
            typingHistory: {
              $each: [typingData],
              $slice: -25,
            },
          },
        }
      );

      res.status(200).json({ message: 'Typing history updated' });
    } catch (error) {
      console.error('Error in update_history API:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default updateHistory;
