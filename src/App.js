import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import TokenMaster from "./abis/TokenMaster.json";

// Config
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);

  const loadBlockchainData = async () => {
    //Fetch account
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Refresh account
    window.ethereum.on("accountsChanged", async (accounts) => {
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };
  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <h2 className="header__title"><strong>Event</strong>Ticket</h2>
      </header>
      <h1>Hellow, World</h1>
      <p>{account}</p>
    </div>
  );
}

export default App;
