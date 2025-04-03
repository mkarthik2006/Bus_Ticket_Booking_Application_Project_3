// src/components/SeatSelection.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

const SeatSelection = () => {
  const { busId } = useParams();
  const navigate = useNavigate();

  // State to hold the fetched seat grid
  const [seatData, setSeatData] = useState({
    bus: null,
    seats: [],
    maxRows: 0
  });
  // Track selected seats (an array of seat numbers)
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (busId) {
      apiClient.get(`/api/buses/${busId}/seats`)
        .then(response => {
          console.log('Fetched seat grid:', response.data);
          setSeatData(response.data);
        })
        .catch(error => {
          console.error('Error fetching seat data:', error);
        });
    }
  }, [busId]);

  // Group seats by row for grid layout
  const groupedSeats = {};
  seatData.seats.forEach(seat => {
    const row = seat.seatRow;
    if (!groupedSeats[row]) {
      groupedSeats[row] = [];
    }
    groupedSeats[row].push(seat);
  });
  // Sort rows in order and sort seats by column in each row
  const sortedRows = Object.keys(groupedSeats)
    .sort((a, b) => a - b)
    .map(rowNum => {
      return {
        row: rowNum,
        seats: groupedSeats[rowNum].sort((a, b) => a.seatCol - b.seatCol)
      };
    });

  // Toggle selection of a seat when clicked (only if available)
  const toggleSeatSelection = (seat) => {
    // Allow selection only if seat is AVAILABLE
    if (seat.status !== 'AVAILABLE') return;

    const alreadySelected = selectedSeats.includes(seat.seatNumber);
    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  // Called when the user clicks "Proceed" (or "Book Now")
  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }
    const seatsParam = selectedSeats.join(',');
    // Optionally, call your booking endpoint:
    apiClient.post(`/api/buses/${busId}/seats/book`, null, {
      params: { selectedSeats: seatsParam }
    })
      .then(() => {
        alert('Seats booked successfully!');
        // For example, navigate to payment:
        navigate(`/payment?busId=${busId}&seats=${seatsParam}`);
      })
      .catch(error => {
        console.error('Seat booking failed:', error);
        alert('Seat booking failed. Please try again.');
      });
  };

  // Determine button styling based on seat status and selection
  const getSeatStyle = (seat) => {
    let baseStyle = {
      width: '40px',
      height: '40px',
      margin: '5px',
      textAlign: 'center',
      lineHeight: '40px',
      border: '1px solid #000',
      cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'default'
    };

    if (seat.status === 'BOOKED') {
      return { ...baseStyle, backgroundColor: 'gray', color: 'white' };
    } else if (selectedSeats.includes(seat.seatNumber)) {
      return { ...baseStyle, backgroundColor: 'orange' };
    }
    return { ...baseStyle, backgroundColor: 'lightgreen' };
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>
        Seat Layout for {seatData.bus ? seatData.bus.busName : 'Loading...'}
      </h2>
      {sortedRows.length > 0 ? (
        sortedRows.map(rowObj => (
          <div key={rowObj.row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {rowObj.seats.map(seat => (
              <button
                key={seat.id}
                style={getSeatStyle(seat)}
                onClick={() => toggleSeatSelection(seat)}
                disabled={seat.status !== 'AVAILABLE'}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>
        ))
      ) : (
        <p>No seats available. Please check if the bus has seats configured.</p>
      )}
      {selectedSeats.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Selected Seats:</strong> {selectedSeats.join(', ')}
        </div>
      )}
      <button
        onClick={handleProceed}
        style={{ marginTop: '1rem', padding: '10px 20px', fontSize: '16px' }}
      >
        Book Now
      </button>
    </div>
  );
};

export default SeatSelection;
