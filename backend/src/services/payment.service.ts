// src/services/payment.service.ts
import { prisma } from '../lib/prisma.js';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

interface RazorpayPaymentVerify {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class PaymentService {
  private razorpay: {
    orders: { create: (opts: object) => Promise<RazorpayOrder> };
  } | null = null;

  private async getRazorpay() {
    if (this.razorpay) return this.razorpay;
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_your')) {
      return null; // Not configured — dev mode
    }
    const Razorpay = (await import('razorpay')).default;
    this.razorpay = new (Razorpay as any)({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    return this.razorpay;
  }

  // Create Razorpay order for a booking
  async createOrder(bookingId: string): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error('Booking not found');

    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);
    const rzp = await this.getRazorpay();

    if (!rzp) {
      // Dev fallback — return mock order
      const mockOrderId = `order_dev_${Date.now()}`;
      await prisma.payment.create({
        data: {
          bookingId,
          razorpayOrderId: mockOrderId,
          amount: booking.totalAmount,
          currency: booking.currency,
          status: 'PENDING',
        },
      });
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: booking.currency,
        keyId: process.env.RAZORPAY_KEY_ID ?? 'rzp_test_demo',
      };
    }

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: booking.currency,
      receipt: booking.bookingRef,
      notes: { bookingId, userId: booking.userId },
    });

    await prisma.payment.create({
      data: {
        bookingId,
        razorpayOrderId: order.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: 'PENDING',
      },
    });

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: booking.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }

  // Verify Razorpay payment signature
  async verifyPayment(data: RazorpayPaymentVerify): Promise<boolean> {
    const { createHmac } = await import('crypto');
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(body)
      .digest('hex');
    return expectedSig === data.razorpay_signature;
  }

  // Mark payment as paid and update booking
  async confirmPayment(razorpayOrderId: string, razorpayPayId: string, signature: string) {
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
    if (!payment) throw new Error('Payment record not found');

    // Verify signature
    const isValid = await this.verifyPayment({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPayId,
      razorpay_signature: signature,
    });

    if (!isValid && !razorpayOrderId.startsWith('order_dev_')) {
      throw new Error('Invalid payment signature');
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId },
        data: { razorpayPayId, status: 'PAID' },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAmount: payment.amount,
          confirmedAt: new Date(),
        },
      }),
    ]);

    // Increment package booking count
    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      select: { 
        packageId: true, 
        userId: true, 
        bookingRef: true,
        totalAmount: true,
        user: { select: { firstName: true, email: true } },
        package: { select: { title: true } }
      },
    });

    if (booking?.packageId) {
      await prisma.package.update({
        where: { id: booking.packageId },
        data: { totalBookings: { increment: 1 } },
      });
    }

    // Trigger Notifications & Emails
    if (booking?.userId && booking.user) {
      // 1. In-app Notification
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: 'Payment Confirmed ✅',
          message: `Payment for booking #${booking.bookingRef.slice(-8).toUpperCase()} has been confirmed!`,
          type: 'PAYMENT',
          actionUrl: `/dashboard/bookings/${payment.bookingId}`,
        },
      });

      // 2. Email Confirmation
      try {
        const { emailService } = await import('./email.service.js');
        await emailService.sendBookingConfirmation(
          booking.user.email,
          booking.user.firstName,
          booking.bookingRef.slice(-8).toUpperCase(),
          booking.package?.title ?? 'Travel Package',
          Number(booking.totalAmount)
        );
      } catch (err) {
        console.error('Failed to send booking confirmation email:', err);
      }
    }

    return { success: true };
  }
}

export const paymentService = new PaymentService();
