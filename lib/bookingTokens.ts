import crypto from 'crypto';

// Booking cancellation links are sent to guests by email and are therefore
// unauthenticated. To stop anyone who obtains/guesses a booking id from
// cancelling arbitrary bookings, each link carries an HMAC token derived from
// the booking id and a server-only secret. The cancel endpoint verifies it.
function getSecret(): string {
  const secret =
    process.env.BOOKING_CANCEL_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) {
    throw new Error(
      'BOOKING_CANCEL_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to sign booking cancellation links.'
    );
  }
  return secret;
}

export function signCancelToken(bookingId: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(`cancel:${bookingId}`)
    .digest('hex');
}

export function verifyCancelToken(
  bookingId: string,
  token: string | null | undefined
): boolean {
  if (!token) return false;
  const expected = signCancelToken(bookingId);
  const provided = Buffer.from(token);
  const digest = Buffer.from(expected);
  // timingSafeEqual throws if the buffers differ in length.
  if (provided.length !== digest.length) return false;
  return crypto.timingSafeEqual(provided, digest);
}
