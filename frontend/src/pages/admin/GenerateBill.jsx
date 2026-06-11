// ADMIN - GENERATE BILL
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateBill } from '../../services/api';

const GenerateBill = () => {
  const { orderId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBill(); }, [orderId]);

  const fetchBill = async () => {
    try { const res = await generateBill(orderId); setBill(res.data); } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  if (loading) return <p className="text-center text-secondary py-5">Loading bill...</p>;
  if (!bill) return <p className="text-center text-secondary py-5">Bill not found</p>;

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <div className="card border-dark-custom p-4">
      
        <div className="text-center mb-3">
          <h4 className="brand-logo mb-0" style={{ letterSpacing: '3px' }}>PIZZERIA</h4>
          <small className="text-secondary">Fresh. Hot. Delivered.</small>
        </div>

        <hr style={{ borderColor: '#2A2A2A' }} />

        
        <div className="d-flex justify-content-between mb-1"><small className="text-secondary">Bill No</small><small className="text-white">{bill.billNumber}</small></div>
        <div className="d-flex justify-content-between mb-1"><small className="text-secondary">Date</small><small className="text-white">{new Date(bill.date).toLocaleDateString('en-IN')}</small></div>
        <div className="d-flex justify-content-between mb-1"><small className="text-secondary">Customer</small><small className="text-white">{bill.customer.name}</small></div>
        <div className="d-flex justify-content-between mb-1"><small className="text-secondary">Email</small><small className="text-white">{bill.customer.email}</small></div>

        <hr style={{ borderColor: '#2A2A2A' }} />

        
        <table className="table table-dark table-borderless mb-0" style={{ background: 'transparent' }}>
          <thead>
            <tr className="text-secondary" style={{ fontSize: '0.8rem' }}>
              <th>Item</th><th className="text-center">Qty</th><th className="text-center">Price</th><th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr key={i} style={{ fontSize: '0.9rem' }}>
                <td className="text-white">{item.name}</td>
                <td className="text-center text-secondary">{item.quantity}</td>
                <td className="text-center text-secondary">₹{item.price}</td>
                <td className="text-end text-white">₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr style={{ borderColor: '#2A2A2A' }} />

        <div className="d-flex justify-content-between mb-1"><span className="text-secondary">Subtotal</span><span className="text-white">₹{bill.subtotal}</span></div>
        <div className="d-flex justify-content-between mb-1"><span className="text-success-custom">Discount ({bill.discountPercent}%)</span><span className="text-success-custom">-₹{bill.discountAmount}</span></div>
        <div className="d-flex justify-content-between mb-1"><span className="text-secondary">GST ({bill.gstPercent}%)</span><span className="text-white">+₹{bill.gstAmount}</span></div>

        <hr style={{ borderColor: '#2A2A2A' }} />

        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold text-brand" style={{ fontSize: '1.2rem' }}>Grand Total</span>
          <span className="fw-bold text-brand" style={{ fontSize: '1.2rem' }}>₹{bill.totalAmount}</span>
        </div>

        <div className="d-flex justify-content-between mb-1">
          <small className="text-secondary">Payment</small>
          <small className={bill.paymentStatus === 'completed' ? 'text-success-custom' : 'text-warning'}>{bill.paymentStatus === 'completed' ? 'PAID' : 'PENDING'}</small>
        </div>
        <div className="d-flex justify-content-between mb-3">
          <small className="text-secondary">Delivery</small>
          <small className="text-white text-capitalize">{bill.deliveryMode}</small>
        </div>

        <p className="text-center text-secondary fst-italic mb-3" style={{ fontSize: '0.85rem' }}>Thank you for ordering!</p>

        <button className="btn btn-danger w-100 fw-semibold no-print" onClick={() => window.print()}>Print Bill</button>
      </div>
    </div>
  );
};

export default GenerateBill;
