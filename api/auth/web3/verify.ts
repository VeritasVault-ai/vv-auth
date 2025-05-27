import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// This is a sample implementation of a backend API endpoint for Web3 signature verification
// In a real application, you would need to adapt this to your specific backend framework

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Verifies a signature and issues a JWT token
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, message, signature } = req.body;

    // Validate inputs
    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check if recovered address matches claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Address mismatch' });
    }

    // Check if user exists in Supabase
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('id, wallet_addresses')
      .filter('user_metadata->wallet_addresses', 'cs', )
      .limit(1);

    if (queryError) {
      console.error('Error querying user:', queryError);
      return res.status(500).json({ error: 'Database error' });
    }

    let userId;

    if (existingUsers && existingUsers.length > 0) {
      // User exists, get their ID
      userId = existingUsers[0].id;
    } else {
      // User doesn't exist, create a new one
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ,
        email_confirm: true,
        user_metadata: {
          wallet_addresses: [
            {
              address: address.toLowerCase(),
              type: 'ethereum',
              linkedAt: new Date().toISOString(),
            },
          ],
          provider: 'web3',
        },
      });

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.user.id;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        sub: userId,
        aud: 'authenticated',
        role: 'authenticated',
        wallet_address: address.toLowerCase(),
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return JWT
    return res.status(200).json({ jwt: token });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
