import React from "react";

const apiModules = [

  {

    title: "Wallet",

    endpoints: ["Get Wallet", "Create Wallet", "Update Wallet", "Delete Wallet"],

  },

  {

    title: "Stocks",

    endpoints: ["Get All Stocks", "Get Stock By ID", "Create Stock", "Update Stock", "Delete Stock"],

  },

  {

    title: "Stock Prices",

    endpoints: ["Get All Prices", "Get Price By Stock ID", "Create Price Entry", "Update Price Entry", "Delete Price Entry"],

  },

  {

    title: "Orders",

    endpoints: ["Get All Orders", "Get Order By ID", "Create Order", "Update Order", "Delete Order"],

  },

  {

    title: "Portfolio",

    endpoints: ["Get Portfolio", "Add Stock To Portfolio", "Update Portfolio Entry", "Remove Stock From Portfolio"],

  },

  {

    title: "Transactions",

    endpoints: ["Get All Transactions", "Get Transaction By ID", "Create Transaction", "Delete Transaction"],

  },

  {

    title: "Watchlist",

    endpoints: ["Get Watchlist", "Add To Watchlist", "Remove From Watchlist"],

  },

  {

    title: "Analytics Snapshots",

    endpoints: ["Get All Snapshots", "Get Snapshot By ID", "Create Snapshot", "Delete Snapshot"],

  },

];

export default function Dashboard() {

  const handleClick = (module, endpoint) => {

    console.log(`API Call -> ${module} : ${endpoint}`);

    alert(`Dummy API Call Triggered: ${module} - ${endpoint}`);

  };

  return (

    <div className="dashboard">

      <h1>Portfolio Manager API Dashboard</h1>

      <div className="modules-container">

        {apiModules.map((mod, index) => (

          <div key={index} className="module-card">

            <h2>{mod.title}</h2>

            <div className="button-list">

              {mod.endpoints.map((ep, idx) => (

                <button

                  key={idx}

                  onClick={() => handleClick(mod.title, ep)}

                >

                  {ep}

                </button>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}