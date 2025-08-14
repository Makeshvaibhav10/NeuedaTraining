import React, { useEffect, useState } from "react";

import "./App.css";

function App() {

  const [news, setNews] = useState("Loading financial news...");

  const [summary, setSummary] = useState("");

  const [snapshot, setSnapshot] = useState("");

  useEffect(() => {

    async function loadRSSNews() {

      const rssUrl = encodeURIComponent(

        "https://news.google.com/rss/search?q=finance&hl=en-US&gl=US&ceid=US:en"

      );

      const proxyUrl = `https://api.allorigins.win/raw?url=${rssUrl}`;

      try {

        const res = await fetch(proxyUrl);

        const text = await res.text();

        const parser = new DOMParser();

        const xml = parser.parseFromString(text, "application/xml");

        const items = xml.querySelectorAll("item");

        const headlines = Array.from(items)

          .slice(0, 10)

          .map((i) => i.querySelector("title").textContent)

          .join(" • ");

        setNews(headlines);

      } catch (err) {

        console.error(err);

        setNews("Error loading news.");

      }

    }

    loadRSSNews();

  }, []);

  return (

    <div className="dashboard">

      <header>

        <h1>Stock Trading Dashboard</h1>

      </header>

      <div className="grid-container">

        <Card title="Place Order">

          <form>

            <input type="text" placeholder="Stock Symbol" required />

            <select required>

              <option value="BUY">BUY</option>

              <option value="SELL">SELL</option>

            </select>

            <input type="number" placeholder="Quantity" min="1" required />

            <input type="number" placeholder="Price" step="0.01" min="0.01" required />

            <button type="submit">Place Order</button>

          </form>

        </Card>

        <Card title="Execute Order">

          <form>

            <input type="text" placeholder="Stock Symbol" required />

            <button type="submit">Execute Next Pending Order</button>

          </form>

        </Card>

        <Card title="Cancel Order">

          <form>

            <input type="text" placeholder="Stock Symbol" required />

            <input type="number" placeholder="Order ID" required />

            <button type="submit">Cancel Order</button>

          </form>

        </Card>

        <Card title="Get Portfolio Summary">

          <form

            onSubmit={(e) => {

              e.preventDefault();

              setSummary("Summary data for your request...");

            }}

          >

            <input type="text" placeholder="Stock Symbol" required />

            <button type="submit">Get Summary</button>

          </form>

          <div className="results">{summary}</div>

        </Card>

        <Card title="Portfolio Snapshot">

          <button onClick={() => setSnapshot("Snapshot calculated successfully!")}>

            Calculate Snapshot

          </button>

          <div className="results">{snapshot}</div>

        </Card>

      </div>

      <div id="news-bar">

        <div id="news-text">{news}</div>

      </div>

    </div>

  );

}

function Card({ title, children }) {

  return (

    <section className="card">

      <h2>{title}</h2>

      {children}

    </section>

  );

}

export default App;