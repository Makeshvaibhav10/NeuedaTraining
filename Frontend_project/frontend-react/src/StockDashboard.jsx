import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";

const MARKET_DATA_BASE = "https://marketdata.neueda.com/API/StockFeed";
const BACKEND_BASE = "http://localhost:8082/api"; // your backend

async function fetchSymbols() {
  const res = await fetch(`${MARKET_DATA_BASE}/GetSymbolList`);
  if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.status}`);
  return res.json();
}

async function fetchSymbolHistory(symbol, days = 30) {
  const res = await fetch(
    `${MARKET_DATA_BASE}/GetStockPricesForSymbol/${symbol}?HowManyValues=${days}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`);
  return res.json();
}

async function addToWatchlist(portfolioId, symbol, companyName) {
  const res = await fetch(
    `${BACKEND_BASE}/watchlist?portfolioId=${portfolioId}&symbol=${symbol}&companyName=${encodeURIComponent(
      companyName
    )}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Failed to add ${symbol} to watchlist`);
}

function formatChartData(data) {
  return data.map((point, idx) => ({
    name: point.dateTime || `Day ${idx + 1}`,
    price: point.price || point.close || 0,
  }));
}

export default function StockDashboard() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSymbol, setModalSymbol] = useState(null);
  const [modalChartData, setModalChartData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15; // number of rows per page

  const portfolioId = 1; // TODO: make dynamic

  useEffect(() => {
    async function loadSymbols() {
      try {
        setLoading(true);
        const list = await fetchSymbols();
        setSymbols(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSymbols();
  }, []);

  const openModal = async (symObj) => {
    setModalOpen(true);
    setModalSymbol(symObj);
    setModalLoading(true);
    try {
      const history = await fetchSymbolHistory(symObj.symbol, 30);
      setModalChartData(formatChartData(history));
    } catch (err) {
      alert(`Error loading chart for ${symObj.symbol}: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSymbol(null);
    setModalChartData([]);
  };

  const handleAddToWatchlist = async (symObj) => {
    try {
      await addToWatchlist(portfolioId, symObj.symbol, symObj.companyName);
      alert(`⭐ ${symObj.symbol} added to watchlist`);
    } catch (err) {
      alert(`Error adding to watchlist: ${err.message}`);
    }
  };

  // Search filter
  const filteredSymbols = symbols.filter(
    (sym) =>
      sym.symbol.toLowerCase().includes(search.toLowerCase()) ||
      sym.companyName.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSymbols.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const currentPageData = filteredSymbols.slice(startIdx, startIdx + pageSize);

  if (loading) return <p>Loading stock list...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading} > All Market Stocks</h1>

      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="🔍 Search by symbol or company..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset pagination on search
          }}
          style={styles.search}
        />
      </div>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Symbol</th>
            <th style={styles.th}>Company</th>
            <th style={styles.th}>Watchlist</th>
            <th style={styles.th}>Chart</th>
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((symObj, idx) => (
            <tr
              key={symObj.symbol}
              style={idx % 2 ? styles.rowOdd : styles.rowEven}
            >
              <td style={styles.td}>{symObj.symbol}</td>
              <td style={styles.td}>{symObj.companyName}</td>
              <td style={styles.td}>
                <Star
                  size={18}
                  style={{ cursor: "pointer", color: "#999" }}
                  onClick={() => handleAddToWatchlist(symObj)}
                />
              </td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => openModal(symObj)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={styles.pagination}>
        <button
          style={styles.pageButton}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ◀ Prev
        </button>
        <span style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          style={styles.pageButton}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>
              ✖
            </button>
            <h2>
              📈 {modalSymbol.symbol} - {modalSymbol.companyName}
            </h2>
            {modalLoading ? (
              <p>Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={modalChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#007bff"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px", // ✅ Keep content narrow
    margin: "0 auto", // ✅ Center align in page
  },
  heading: { textAlign: "center", marginBottom: "20px" },
  searchWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  search: {
    width: "50%",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "20px",
    outline: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    background: "#fff", // ✅ white table over bg
    borderRadius: "8px", // ✅ smooth corners
    overflow: "hidden", // ✅ round edges clean
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  th: { background: "#f5f5f5", padding: "8px", fontSize: "14px" },
  td: { padding: "8px", fontSize: "14px", borderBottom: "1px solid #eee" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#fafafa" },
  button: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  pagination: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  pageButton: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  },
  pageInfo: { fontSize: "14px", fontWeight: "bold" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "80%",
    maxWidth: "700px",
    position: "relative",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};
