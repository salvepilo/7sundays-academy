import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/forgotPassword`,
        req.body
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        res
          .status(error.response.status)
          .json(error.response.data);
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}