import './App.css';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';

function App(_props) {
  const [genHash, setGenHash] = useState('Fetching genesis hash...');
  const [epochDuration, setEpochDuration] = useState('Fetching epoch...');
  const [balance, setBalance] = useState('0.00');
  const [chainName, setChainName] = useState('Getting chain name...');
  const [connected, setConnected] = useState(false);
  //retrieve latest header
  const [lastheader, setLastHeader] = useState('getting last header...')
  const [accounts, setAccounts] = useState(null);
  const [api, setApi] = useState(null);

  const LOCAL_WALLET_ADDRESS = '5Eq3CxGkiL7jXq3XuZe8Nb69HRACJSZj6A5dQLtoFwy13kDC';

  useEffect(() => {
    const apiSetUp = async () => {
      try {
        const wsProvider = new WsProvider('wss://rococo-contracts-rpc.polkadot.io');
        let connApi = await ApiPromise.create({ provider: wsProvider });
        setApi(connApi);
        } catch (error) {
        console.log(error);
      }
    }
    apiSetUp();
  }, []);

  const handleConnect = async () => {
    //set node data
        const { nonce, data: balance } = await api.query.system.account(LOCAL_WALLET_ADDRESS);
        const chain = await api.rpc.system.chain();
        const lastheader = await api.rpc.chain.getHeader();
      
        setGenHash(api.genesisHash.toHex());
        setBalance(balance.toString());
        setChainName(chain);
        setLastHeader(lastheader.hash)


        const allInjectedExtensions = await web3Enable('freeden_blog');
        const allAccounts = await web3Accounts();
        // injector = await web3FromAddress(LOCAL_WALLET_ADDRESS);
        if (allInjectedExtensions && allAccounts) {
          setConnected(true);
          setAccounts(allAccounts);
        }
  }

  //make a transaction  to the blog service contract
   const subscribe = async() => {
      const account = accounts[0];
      const transferExtrinsic = api.tx.balances.transfer('5HiW2C2YLsVit73jC7h3x25hbXGpMZp4qxmVF3Qh7VY26eqR', 200000000000);
      const injector = await web3FromSource(account.meta.source);
      transferExtrinsic.signAndSend(account.address, {signer: injector.signer}, ({status}) => {
        if(status.isInBlock) {
          console.log('Subscribed');
        } else {
          console.log('In progress');
        }
      });
   }

  return (
    <div className="App">
      <p>{genHash}</p>
      <p>{balance}</p>
      <p>{chainName}</p>
      <p>{lastheader}</p>
      <hr/>
      <div>
        <button type='button' onClick={handleConnect}>{connected ? 'Connected' : 'Connect'}</button>
       </div>
       <div>
        <button type='button' onClick={subscribe}>Subscribe</button>
      </div>
    </div>
  );
}

export default App;
