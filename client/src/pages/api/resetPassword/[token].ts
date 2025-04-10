import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  if (req.method === 'PATCH') {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resetPassword/${token}`,
        req.body
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: 'Errore durante la richiesta' });
      }
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}