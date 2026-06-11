// NOTIFICATION SERVICE - sends order confirmation email using Gmail SMTP
// PDF: "Automated Email Notification Agent"

const nodemailer = require('nodemailer');

const sendOrderEmail = async (userEmail, order) => {
  try {
    // Create transporter using Gmail credentials from environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS // 16-character Gmail App Password generated from account settings
      }
    });

    const orderIdShort = order._id.toString().slice(-6).toUpperCase();
    // Format order items table rows
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #333;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #333;">INR ${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #E50914; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #E50914; margin: 0; font-size: 28px; letter-spacing: 1px;">PIZZERIA</h1>
          <p style="color: #888; margin: 5px 0 0 0; font-size: 13px;">Fresh. Hot. Delivered.</p>
        </div>
        
        <h3 style="color: #222; font-size: 20px; margin-top: 0;">Order Confirmation</h3>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">Dear Customer,</p>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">Thank you for ordering with Pizzeria. Your order has been placed successfully and our kitchen is preparing it fresh for you.</p>
        
        <div style="margin-top: 25px;">
          <h4 style="color: #222; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order #${orderIdShort}</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left; color: #444; font-weight: 600;">Item</th>
                <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #444; font-weight: 600;">Qty</th>
                <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #444; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold; border-top: 1px solid #ddd; color: #333;">Subtotal</td>
                <td style="padding: 10px; font-weight: bold; border-top: 1px solid #ddd; text-align: right; color: #333;">INR ${order.subtotal}</td>
              </tr>
              ${order.discountAmount ? `
              <tr>
                <td colspan="2" style="padding: 10px; color: #2e7d32;">Discount (${order.discountPercent}%)</td>
                <td style="padding: 10px; color: #2e7d32; text-align: right;">- INR ${order.discountAmount}</td>
              </tr>
              ` : ''}
              ${order.gstAmount ? `
              <tr>
                <td colspan="2" style="padding: 10px; color: #666;">GST (${order.gstPercent}%)</td>
                <td style="padding: 10px; color: #666; text-align: right;">+ INR ${order.gstAmount}</td>
              </tr>
              ` : ''}
              <tr style="background-color: #fff9f9;">
                <td colspan="2" style="padding: 12px 10px; font-weight: bold; border-top: 2px solid #E50914; color: #222; font-size: 1.05rem;">Total Amount</td>
                <td style="padding: 12px 10px; font-weight: bold; border-top: 2px solid #E50914; text-align: right; color: #E50914; font-size: 1.15rem;">INR ${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #E50914;">
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;"><strong>Delivery Mode:</strong> ${order.deliveryMode === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
          ${order.deliveryAddress ? `<p style="margin: 0; font-size: 14px; color: #666;"><strong>Address:</strong> ${order.deliveryAddress}</p>` : ''}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          <p style="margin: 0;">Pizzeria Inc., Sector 5, Salt Lake, Kolkata</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: `Order Confirmed - Order #${orderIdShort} | Pizzeria`,
      html: htmlBody
    });

    console.log(`[EMAIL AGENT] Order confirmation sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[EMAIL AGENT] Error sending email:', error.message);
    return false;
  }
};

module.exports = { sendOrderEmail };
