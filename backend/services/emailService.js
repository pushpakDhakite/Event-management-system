const notifications = [];

const emailTemplates = {
  event_confirmation: (event) => ({
    subject: `Event Confirmed: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Event Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Your event <strong>${event.name}</strong> has been confirmed.</p>
          <p><strong>Date:</strong> ${event.event_date}</p>
          <p><strong>Time:</strong> ${event.start_time} - ${event.end_time}</p>
          <p><strong>Venue:</strong> ${event.venue || 'TBD'}</p>
          <p><strong>Guests:</strong> ${event.guest_count || 0}</p>
          <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Event</a>
        </div>
      </div>
    `
  }),
  booking_confirmation: (booking) => ({
    subject: `Booking Confirmed: ${booking.service_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Your booking for <strong>${booking.service_name}</strong> has been confirmed.</p>
          <p><strong>Vendor:</strong> ${booking.vendor_name}</p>
          <p><strong>Amount:</strong> $${booking.total_price}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        </div>
      </div>
    `
  }),
  guest_invitation: (event, guest) => ({
    subject: `You're Invited: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">You're Invited!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear <strong>${guest.name}</strong>,</p>
          <p>You have been invited to <strong>${event.name}</strong>.</p>
          <p><strong>Date:</strong> ${event.event_date}</p>
          <p><strong>Venue:</strong> ${event.venue || 'TBD'}</p>
          <a href="#" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">RSVP Now</a>
        </div>
      </div>
    `
  }),
  payment_receipt: (payment) => ({
    subject: `Payment Receipt: ${payment.invoice_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Payment Receipt</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p><strong>Invoice:</strong> ${payment.invoice_number}</p>
          <p><strong>Amount:</strong> $${payment.amount}</p>
          <p><strong>Method:</strong> ${payment.payment_method}</p>
          <p><strong>Status:</strong> ${payment.status}</p>
          <p><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    `
  }),
  vendor_booking_request: (booking) => ({
    subject: `New Booking Request: ${booking.service_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Booking Request</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>You have a new booking request for <strong>${booking.service_name}</strong>.</p>
          <p><strong>Event:</strong> ${booking.event_name}</p>
          <p><strong>Amount:</strong> $${booking.total_price}</p>
          <a href="#" style="display: inline-block; background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Request</a>
        </div>
      </div>
    `
  })
};

const sendEmail = async (to, subject, html) => {
  const notification = {
    id: Date.now(),
    to,
    subject,
    html,
    sent_at: new Date().toISOString(),
    status: 'sent'
  };
  notifications.push(notification);
  console.log(`[Email Simulated] To: ${to} | Subject: ${subject}`);
  return { success: true, notificationId: notification.id };
};

const sendEventConfirmation = async (event, to) => {
  const template = emailTemplates.event_confirmation(event);
  return sendEmail(to, template.subject, template.html);
};

const sendBookingConfirmation = async (booking, to) => {
  const template = emailTemplates.booking_confirmation(booking);
  return sendEmail(to, template.subject, template.html);
};

const sendGuestInvitation = async (event, guest) => {
  if (!guest.email) return { success: false, reason: 'No email' };
  const template = emailTemplates.guest_invitation(event, guest);
  return sendEmail(guest.email, template.subject, template.html);
};

const sendPaymentReceipt = async (payment, to) => {
  const template = emailTemplates.payment_receipt(payment);
  return sendEmail(to, template.subject, template.html);
};

const sendVendorBookingRequest = async (booking, vendorEmail) => {
  const template = emailTemplates.vendor_booking_request(booking);
  return sendEmail(vendorEmail, template.subject, template.html);
};

const getSentEmails = () => notifications;

const clearSentEmails = () => { notifications.length = 0; };

module.exports = {
  sendEmail,
  sendEventConfirmation,
  sendBookingConfirmation,
  sendGuestInvitation,
  sendPaymentReceipt,
  sendVendorBookingRequest,
  getSentEmails,
  clearSentEmails,
  emailTemplates
};
