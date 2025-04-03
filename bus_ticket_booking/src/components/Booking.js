import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const busIdFromQuery = searchParams.get('busId') || '';
  const navigate = useNavigate();

  // Overall booking state
  const [booking, setBooking] = useState({
    busId: busIdFromQuery,
    boardingPoint: '',
    droppingPoint: '',
    passengers: []
  });

  // Bus info (for display)
  const [busDetails, setBusDetails] = useState({
    busName: '',
    busNumber: ''
  });

  // Seat data from backend
  const [seatData, setSeatData] = useState({
    bus: null,
    seats: [],
    maxRows: 0
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal for adding passenger
  const [showModal, setShowModal] = useState(false);
  const [tempPassenger, setTempPassenger] = useState({
    name: '',
    gender: '',
    phoneNumber: '',
    email: '',
    seatNumber: ''
  });

  // Track seat user just clicked (pending selection)
  const [pendingSeat, setPendingSeat] = useState(null);

  // 1) Fetch bus details
  useEffect(() => {
    if (busIdFromQuery) {
      apiClient.get(`/api/buses/${busIdFromQuery}`)
        .then(response => {
          const bus = response.data;
          console.log('Bus details:', bus);
          setBooking(prev => ({
            ...prev,
            boardingPoint: bus.routeFrom,
            droppingPoint: bus.routeTo
          }));
          setBusDetails({
            busName: bus.busName || '',
            busNumber: bus.busNumber || ''
          });
        })
        .catch(err => console.error('Failed to fetch bus details:', err));
    }
  }, [busIdFromQuery]);

  // 2) Fetch seat grid
  useEffect(() => {
    if (busIdFromQuery) {
      apiClient.get(`/api/buses/${busIdFromQuery}/seats`)
        .then(response => {
          console.log('Seat data response:', response.data);
          setSeatData(response.data);
        })
        .catch(err => console.error('Failed to fetch seat data:', err));
    }
  }, [busIdFromQuery]);

  // 3) Update booking fields if needed
  const handleChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  };

  // 4) Modal logic
  const openModal = (seatNumber = '') => {
    setPendingSeat(seatNumber);
    setTempPassenger({ name: '', gender: '', phoneNumber: '', email: '', seatNumber });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingSeat(null);
  };

  const handleTempPassengerChange = (e) => {
    const { name, value } = e.target;
    setTempPassenger({ ...tempPassenger, [name]: value });
  };

  const handleAddPassengerFromModal = () => {
    // Check if seat is already allocated
    if (
      tempPassenger.seatNumber &&
      booking.passengers.some(p => p.seatNumber === tempPassenger.seatNumber)
    ) {
      alert(`Seat ${tempPassenger.seatNumber} is already allocated.`);
      return;
    }
    setBooking(prev => ({
      ...prev,
      passengers: [...prev.passengers, tempPassenger]
    }));
    closeModal();
  };

  // 5) Remove passenger
  const handleRemovePassenger = (index) => {
    const updated = booking.passengers.filter((_, i) => i !== index);
    setBooking({ ...booking, passengers: updated });
  };

  // 6) Submit booking
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiClient.post('/api/bookings', booking)
      .then(response => {
        setMessage('Booking successful!');
        setLoading(false);
        const bookingId = response.data.id;
        navigate(`/payment?bookingId=${bookingId}`);
      })
      .catch(() => {
        setMessage('Booking failed. Please try again.');
        setLoading(false);
      });
  };

  // Group seats by row
  const groupSeatsByRow = (seats = []) => {
    const grouped = {};
    seats.forEach(seat => {
      const row = seat.seatRow;
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });
    return Object.keys(grouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(row => grouped[row].sort((a, b) => a.seatCol - b.seatCol));
  };

  const rows = groupSeatsByRow(seatData.seats);

  // Determine seat style
  const getSeatStyle = (seat) => {
    let base = {
      width: '40px',
      height: '40px',
      margin: '5px',
      textAlign: 'center',
      lineHeight: '40px',
      border: '1px solid #000',
      cursor: 'pointer'
    };

    // If seat is BOOKED, mark as unavailable
    if (seat.status === 'BOOKED') {
      return { ...base, backgroundColor: '#ccc', cursor: 'default' };
    }
    // If occupant is present (male/female occupant?), mark accordingly
    if (seat.occupant && seat.occupant.gender === 'MALE') {
      return { ...base, backgroundColor: '#87CEFA', cursor: 'default' };
    }
    if (seat.occupant && seat.occupant.gender === 'FEMALE') {
      return { ...base, backgroundColor: '#FFB6C1', cursor: 'default' };
    }

    // If seat is already allocated to a passenger in this booking
    const allocated = booking.passengers.some(p => p.seatNumber === seat.seatNumber);
    if (allocated) {
      return { ...base, backgroundColor: '#17a2b8', color: '#fff', cursor: 'default' };
    }

    // If seat is pending selection
    if (seat.seatNumber === pendingSeat) {
      return { ...base, backgroundColor: '#FFA500' };
    }

    // Default: available
    return { ...base, backgroundColor: '#fff' };
  };

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return;
    if (seat.occupant) return;
    const allocated = booking.passengers.some(p => p.seatNumber === seat.seatNumber);
    if (allocated) return;
    openModal(seat.seatNumber);
  };

  return (
    <div className="container py-5">
      {message && (
        <div className="alert alert-info text-center mb-4">
          {message}
        </div>
      )}

      <div className="row">
        {/* Seat Map */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-grid-3x3-gap me-2"></i>Seat Map
              </h4>
            </div>
            <div className="card-body">
              {seatData.bus && rows.length > 0 ? (
                <>
                  <p className="text-muted">Click an available seat to allocate it.</p>
                  <div className="d-flex flex-column align-items-center">
                    {rows.map((rowSeats, rowIdx) => (
                      <div key={rowIdx} style={{ display: 'flex' }}>
                        {rowSeats.map(seat => (
                          <div
                            key={seat.id}
                            style={getSeatStyle(seat)}
                            onClick={() => handleSeatClick(seat)}
                          >
                            {seat.seatNumber}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center mb-0">
                  No seat data available. Please check if the bus has seats configured.
                </p>
              )}
            </div>
          </div>

          {/* Seat Legend */}
          <div className="card mt-3">
            <div className="card-header bg-secondary text-white">
              <h4 className="mb-0"><i className="bi bi-info-circle me-2"></i>Seat Legend</h4>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: 20, height: 20, backgroundColor: '#fff', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: 20, height: 20, backgroundColor: '#ccc', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Booked / Unavailable</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: 20, height: 20, backgroundColor: '#87CEFA', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Male Occupant</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: 20, height: 20, backgroundColor: '#FFB6C1', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Female Occupant</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div style={{ width: 20, height: 20, backgroundColor: '#17a2b8', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Allocated in Booking</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: 20, height: 20, backgroundColor: '#FFA500', border: '1px solid #000', marginRight: 5 }}></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-ticket-perforated me-2"></i>Create Booking
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Bus ID */}
                <div className="mb-3">
                  <label htmlFor="busId" className="form-label">
                    <i className="bi bi-bus-front-fill me-1"></i>Bus ID
                  </label>
                  <input
                    type="text"
                    id="busId"
                    name="busId"
                    value={booking.busId}
                    onChange={handleChange}
                    className="form-control"
                    readOnly
                  />
                </div>
                {/* Bus Name / Number */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-card-text me-1"></i>Bus Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={busDetails.busName}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="bi bi-hash me-1"></i>Bus Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={busDetails.busNumber}
                      readOnly
                    />
                  </div>
                </div>
                {/* Boarding & Dropping Points */}
                <div className="mb-3">
                  <label htmlFor="boardingPoint" className="form-label">
                    <i className="bi bi-door-open-fill me-1"></i>Boarding Point
                  </label>
                  <input
                    type="text"
                    id="boardingPoint"
                    name="boardingPoint"
                    value={booking.boardingPoint}
                    onChange={handleChange}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="droppingPoint" className="form-label">
                    <i className="bi bi-door-closed-fill me-1"></i>Dropping Point
                  </label>
                  <input
                    type="text"
                    id="droppingPoint"
                    name="droppingPoint"
                    value={booking.droppingPoint}
                    onChange={handleChange}
                    className="form-control"
                    readOnly
                  />
                </div>
                {/* Passenger Details */}
                <h5 className="mt-3"><i className="bi bi-people-fill me-2"></i>Passenger Details</h5>
                {booking.passengers.length > 0 && booking.passengers.map((passenger, index) => (
                  <div key={index} className="border p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>
                        <i className="bi bi-person-fill me-1"></i>
                        {passenger.name || 'Unnamed'}
                        {passenger.seatNumber && (
                          <span className="badge bg-info ms-2">{passenger.seatNumber}</span>
                        )}
                      </strong>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemovePassenger(index)}
                      >
                        <i className="bi bi-x-circle me-1"></i>Remove
                      </button>
                    </div>
                    <p className="mb-0"><strong>Gender:</strong> {passenger.gender}</p>
                    <p className="mb-0"><strong>Phone:</strong> {passenger.phoneNumber}</p>
                    <p className="mb-0"><strong>Email:</strong> {passenger.email}</p>
                  </div>
                ))}
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => openModal()} // Add passenger without seat selection
                  >
                    <i className="bi bi-plus-circle me-1"></i>Add Passenger
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Book Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Modal */}
      {showModal && (
        <div className="modal show fade" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus-fill me-1"></i>Add Passenger
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Passenger Name</label>
                  <input
                    type="text"
                    name="name"
                    value={tempPassenger.name}
                    onChange={handleTempPassengerChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={tempPassenger.gender}
                    onChange={handleTempPassengerChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={tempPassenger.phoneNumber}
                    onChange={handleTempPassengerChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={tempPassenger.email}
                    onChange={handleTempPassengerChange}
                    className="form-control"
                  />
                </div>
                {tempPassenger.seatNumber && (
                  <div className="mb-3">
                    <label className="form-label">Selected Seat</label>
                    <input
                      type="text"
                      name="seatNumber"
                      value={tempPassenger.seatNumber}
                      readOnly
                      className="form-control"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  <i className="bi bi-x-circle me-1"></i>Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddPassengerFromModal}
                >
                  <i className="bi bi-check-circle me-1"></i>Add Passenger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showModal && (
        <div
          className="modal-backdrop fade show"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
      )}
    </div>
  );
};

export default Booking;
