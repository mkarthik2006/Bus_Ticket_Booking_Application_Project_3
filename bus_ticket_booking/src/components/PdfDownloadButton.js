// src/components/PdfDownloadButton.jsx
import axios from 'axios';
import React from 'react';

const downloadBookingPdf = (bookingId, fileName) => {
    axios.get(`/api/bookings/${bookingId}/pdf`, { responseType: 'blob' })
  .then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })
  .catch((err) => {
    console.error("Error downloading PDF:", err);
  });
};

const PdfDownloadButton = ({ bookingId, userName }) => {
  const handleDownload = () => {
    downloadBookingPdf(bookingId, `Booking_${userName}`);
  };

  return (
    <button onClick={handleDownload}>
      Download PDF Receipt
    </button>
  );
};

export default PdfDownloadButton;
