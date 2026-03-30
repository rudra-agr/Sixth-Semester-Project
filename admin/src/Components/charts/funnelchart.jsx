import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function FunnelChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    
    fetch(`${backendUrl}/api/analytics/funnel`)
      .then(res => res.json())
      .then(funnel => {
        const funnelData = [
          { step: 'Page View', count: funnel.pageView, conversion: '100%' },
          { step: 'Add to Cart', count: funnel.addToCart, conversion: funnel.cartConversion + '%' },
          { step: 'Payment', count: funnel.payment, conversion: funnel.paymentConversion + '%' },
          { step: 'Order Success', count: funnel.orderSuccess, conversion: funnel.successConversion + '%' }
        ];
        setData(funnelData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch funnel data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="chart-container">
      <h3>🔜 Conversion Funnel</h3>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid stroke="#eee" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#27ae60" />
            </BarChart>
          </ResponsiveContainer>
          <div className="funnel-metrics">
            {data.map((step, idx) => (
              <div key={idx} className="metric-row">
                <span className="metric-step">{step.step}</span>
                <span className="metric-count">{step.count} users</span>
                <span className="metric-conversion">{step.conversion} conversion</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FunnelChart;