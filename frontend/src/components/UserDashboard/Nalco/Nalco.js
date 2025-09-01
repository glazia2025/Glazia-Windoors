import React, { useEffect, useState } from 'react';
import {
  MDBCard,
  MDBCardTitle,
  MDBCardBody,
  MDBCardHeader,
  MDBIcon,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBBtn,
  MDBSpinner,
  MDBTypography
} from 'mdb-react-ui-kit';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api, { BASE_API_URL } from '../../../utils/api';
import './Nalco.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart.js Line Chart Component
const NalcoLineChart = ({ data, dateRange }) => {
  // Prepare chart data
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }),
    datasets: [
      {
        label: 'NALCO Price (₹/Kg)',
        data: data.map(item => parseFloat(item.nalcoPrice) / 1000),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#0056b3',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `NALCO Price Trend (${dateRange.start} - ${dateRange.end})`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#007bff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const timestamp = data[dataIndex].date;
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: function(context) {
            return `Price: ₹${context.parsed.y.toFixed(2)}/Kg`;
          },
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const timestamp = data[dataIndex].date;
            const time = new Date(timestamp).toLocaleTimeString('en-IN');
            return `Time: ${time}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (₹/Kg)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(2);
          },
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

const Nalco = ({isLogin = false}) => {
  const [nalco, setNalco] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const fetchNalcoPrice = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get(`${BASE_API_URL}/admin/get-nalco`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNalco(response.data);
    }catch (err) {
      console.log(err);
    }
  }

  const fetchNalcoGraph = async () => {
    setIsLoadingGraph(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get(`${BASE_API_URL}/admin/get-nalco-graph`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      if (data && Array.isArray(data)) {
        setGraphData(data);

        // Calculate date range
        if (data.length > 0) {
          const timestamps = data.map(item => new Date(item.date));
          const startDate = new Date(Math.min(...timestamps));
          const endDate = new Date(Math.max(...timestamps));

          setDateRange({
            start: startDate.toLocaleDateString('en-IN'),
            end: endDate.toLocaleDateString('en-IN')
          });
        }
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching NALCO graph data:', error);
    } finally {
      setIsLoadingGraph(false);
    }
  }

  useEffect(() => {
    fetchNalcoPrice();
  }, []);

  return (
    <div>
      <MDBCard
        background='primary'
        style={{
          marginTop: isLogin ? '0rem' :'4rem',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        className='text-white mb-3 w-100 nalco-card'
        onClick={fetchNalcoGraph}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fetchNalcoGraph();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Click to view NALCO price graph"
      >
        <MDBCardHeader style={{textAlign: 'center'}}>
          <div className="d-flex align-items-center justify-content-center">
            <MDBIcon fas icon="chart-line" className="me-2" />
            {formattedDate} : Today's Nalco Price  ₹{nalco.nalcoPrice/1000} / Kg
            <MDBIcon fas icon="external-link-alt" className="ms-2" size="sm" />
          </div>
          <small className="d-block mt-2 opacity-75">Click to view price graph</small>
        </MDBCardHeader>
      </MDBCard>

      {/* Graph Modal */}
      <MDBModal open={showModal} setOpen={setShowModal} tabIndex='-1'>
        <MDBModalDialog size='fullscreen'>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>
                <MDBIcon fas icon="chart-line" className="me-2" />
                NALCO Price Graph
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {isLoadingGraph ? (
                <div className="text-center py-5">
                  <MDBSpinner role="status">
                    <span className="visually-hidden">Loading...</span>
                  </MDBSpinner>
                  <p className="mt-3">Loading price data...</p>
                </div>
              ) : graphData.length > 0 ? (
                <div className="nalco-graph-container">
                  {/* Date Range Info */}
                  <div className="mb-3 p-3 bg-light rounded">
                    <MDBTypography tag="h6" className="mb-2">
                      <MDBIcon fas icon="calendar-alt" className="me-2" />
                      Price Range Overview
                    </MDBTypography>
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">Date Range:</small>
                        <p className="mb-1 fw-bold">{dateRange.start} - {dateRange.end}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Total Data Points:</small>
                        <p className="mb-1 fw-bold">{graphData.length}</p>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-md-4">
                        <small className="text-muted">Current Price:</small>
                        <p className="mb-1 fw-bold text-primary">₹ {nalco.nalcoPrice/1000} / Kg</p>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Highest:</small>
                        <p className="mb-1 fw-bold text-success">
                          ₹ {graphData.length > 0 ? Math.max(...graphData.map(item => parseFloat(item.nalcoPrice/1000))).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Lowest:</small>
                        <p className="mb-1 fw-bold text-danger">
                          ₹ {graphData.length > 0 ? Math.min(...graphData.map(item => parseFloat(item.nalcoPrice/1000))).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="chart-wrapper text-center">
                    <NalcoLineChart data={graphData} dateRange={dateRange} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <MDBIcon fas icon="chart-line" size="3x" className="text-muted mb-3" />
                  <p className="text-muted">No graph data available</p>
                </div>
              )}
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}

export default Nalco;