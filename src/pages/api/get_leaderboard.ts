import type { IncomingMessage, ServerResponse } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import clientPromise from '../../../lib/mongodb';
import authOptions from './auth/[...nextauth]';

const getLeaderboard = async (
  req:
    | any
    | NextApiRequest
    | (IncomingMessage & { cookies: Partial<{ [key: string]: string }> }),
  res: any | ServerResponse<IncomingMessage> | NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  const userEmail = (session as { user: { email: string } })?.user?.email;

  if (!userEmail) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('fluenttype');
      const usersCollection = db.collection('users');

      const leaderboard = await usersCollection
        .aggregate([
          { $unwind: '$typingHistory' },
          {
            $group: {
              _id: '$email',
              username: { $first: '$username' },
              maxWpm: { $max: '$typingHistory.wpm' },
              meanAccuracy: { $avg: '$typingHistory.accuracy' },
            },
          },
          { $project: { _id: 0, username: 1, maxWpm: 1, meanAccuracy: 1 } },
          { $sort: { maxWpm: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error retrieving leaderboard:', error);
      res.status(500);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default getLeaderboard;
