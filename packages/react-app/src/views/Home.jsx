import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Button, Card, List, Input } from "antd";
import { Address, AddressInput } from "../components";
import {create} from "ipfs-http-client";


/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/

const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
});

function Home({
  isSigner,
  loadWeb3Modal,
  yourCollectibles,
  address,
  blockExplorer,
  mainnetProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  // const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const [mintData, setMintData] = useState({});
  const [transferToAddresses, setTransferToAddresses] = useState({});
  let hash= ''
  let image = '';
  return (
    <div>
      {/* Mint button */}
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <div style={{ margin: 10}}>
            <span>Avatar</span>
                <Input type="file"  onChange={async e => {
                    const result = await ipfs.add(e.target.files[0]);
                    const uri = "https://ipfs.infura.io/ipfs/"+ result.cid.toString()
                    console.log(uri)
                    alert("上传成功！");
                    setMintData({...mintData, uri: uri});
                }}/>
          {/*<Input*/}
          {/*  placeholder="eg. https://noncegeek.com/"*/}
          {/*  onChange={e => {*/}
          {/*    setMintData({...mintData, uri: e.target.value});*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
        <div style={{ margin: 10}}>
          <span>Nickname</span>
          <Input
            placeholder="eg. Dappguy"
            onChange={e => {
              setMintData({...mintData, nickname: e.target.value});
            }}
          />
        </div>
        <div style={{ margin: 10}}>
          <span>Description</span>
          <Input
            placeholder="eg. Web3 developer"
            onChange={e => {
              setMintData({...mintData, description: e.target.value});
            }}
          />
        </div>
        {isSigner ? (
          <Button
            type={"primary"}
            onClick={() => {
              tx(writeContracts.TaiShangProfileNFT.claim(mintData.uri, mintData.nickname, mintData.description));
            }}
          >
            MINT
          </Button>
        ) : (
          <Button type={"primary"} onClick={loadWeb3Modal}>
            CONNECT WALLET
          </Button>
        )}
      </div>
      <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={item => {
            const id = item.id.toNumber();
            console.log("IMAGE",item.image)
            return (
              <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                    </div>
                  }
                >
                  <a href={item.image} target="_blank">
                   <img style={{width: "200px",height: "200px"}} src={item.image} /><br/>
                  {/*<iframe src={item.image} style={{width: "200px",height: "200px"}}></iframe>*/}
                  </a>
                    <br/>
                  <div>{item.nickname}</div>
                </Card>

                <div>
                  owner:{" "}
                  <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    value={transferToAddresses[id]}
                    onChange={newValue => {
                      const update = {};
                      update[id] = newValue;
                      setTransferToAddresses({ ...transferToAddresses, ...update });
                    }}
                  />
                  <Button
                    onClick={() => {
                      console.log("writeContracts", writeContracts);
                      tx(writeContracts.TaiShangProfileNFT.transferFrom(address, transferToAddresses[id], id));
                    }}
                  >
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Home;
