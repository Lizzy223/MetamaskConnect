import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from './style.module.css'

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionFee, setTransactionFee] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    try {
      if (!ethWallet) {
        alert('MetaMask wallet is required to connect');
        return;
      }
  
      const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
      handleAccount(accounts);
    
      // once wallet is set we can get a reference to our deployed contract
      getATMContract();
    }  catch (error) {
        // Handle user rejection
        if (error.code === 4001) {
            console.log("User rejected the connection request");
            alert("MetaMask connection request was cancelled.");
        } else {
            console.error("An error occurred during MetaMask connection:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
   
    }
  }

  const getTransactionFee = async () => {
 try {
    if (atm) {
      setTransactionFee(await atm?.getTransactionFee());
    }

    
  } catch (error) {
    console.error("Error fetching transaction fee:", error);
    handleTransactionError(error);
  }
};


  const handleTransactionError = (error) => {
  if (error.code === 4001) {
    console.log("User rejected the request");
    alert("MetaMask connection request was cancelled.");
  } else {
    console.error("Unexpected error:", error);
    alert(error||"An error occurred. Please try again.");
  }
};


  const deposit = async() => {
    try {
      if (atm) {
        let tx = await atm.deposit(2000);
        await tx.wait()
        getBalance();
      }
    } catch (error) {
        // Handle user rejection
        handleTransactionError(error);
    }
  }

  const transactionFees = async () => {
  try {
    if (atm ) {
      let tx = await atm.updateTransactionFee(10);
      await tx.wait();
      getTransactionFee();
    } else {
      alert("Please enter a valid transaction fee.");
    }
  } catch (error) {
    handleTransactionError(error);
  }
};


  const withdraw = async () => {
  try {
    if (atm && balance > 0) {
      let tx = await atm.withdraw(1); // Update to handle dynamic amounts if needed
      await tx.wait();
      getBalance();
    } else {
      alert("Insufficient balance. There is nothing to withdraw.");
    }
  } catch (error) {
    handleTransactionError(error);
  }
};


  const withdrawAll = async () => {
    try {
      if (atm) {
        let tx = await atm.withdraw(balance);
        await tx.wait()
        getBalance();
      } else if (atm && balance === 0) {
        // return (
        //   <div>Insufficient balance, there is nothing to withdraw</div>
        // )
        alert('Insufficient balance, there is nothing to withdraw')
      }
    } catch (error) {
        // Handle user rejection
        if (error.code === 4001) {
            console.log("User rejected the connection request");
            alert("MetaMask connection request was cancelled.");
        } else {
            console.error("An error occurred during MetaMask connection:", error);
            alert("An unexpected error occurred during MetaMask connection. Please try again.");
        }
    }
  }

 
  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p className={styles.Font}>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button className={styles.ConnectButton}
        onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p className={styles.Font}>Your Account: {account}</p>
        <p className={styles.Font}>Your Balance: {balance}</p>
        <p className={styles.Font}>Transaction Fee: {transactionFee || 0}%</p>
        <button className={styles.ConnectedButton} onClick={deposit}>Deposit 2000 ETH</button>
        <button className={styles.ConnectedButton} onClick={withdraw}>Withdraw 1 ETH</button>
        <button className={styles.ConnectedButton} onClick={withdrawAll}>Withdraw All ETH</button>
        <button className={styles.ConnectedButton} onClick={transactionFees}>Increase Transaction Limit</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className={styles.Container}>
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
      {
        balance === 0 &&
          <div>
            <p className={styles.Font} style={{color:'red'}}>Insufficient balance, top up your account!</p>
        </div>
      }
    </main>
  )
}
