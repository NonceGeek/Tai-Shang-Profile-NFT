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
  return (
    <div>
      {/* Mint button */}
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <div style={{ margin: 10}}>
            <form action="#" id="upload-form">
                <input type="file" id="upload"/>
                <Button
                    onClick={
                        async () => {
                            const files = document.getElementById("upload").files;
                            const result = await ipfs.add(files[0]);
                            const uri = "https://ipfs.io/ipfs/"+ result.cid.toString()
                            setMintData({...mintData, uri: uri});
                        }
                    }
                >上传</Button>
            </form>
          <span>Uri</span>
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
                  <a href={"https://opensea.io/assets/"+(readContracts && readContracts.TaiShangVoxel && readContracts.TaiShangVoxel.address)+"/"+item.id} target="_blank">
                  {/* <img src={item.image} /> */}
                  <iframe src={item.external_url} style={{width: "200px",height: "200px"}}></iframe>
                  </a>
                  <div>{item.description}</div>
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
                      tx(writeContracts.TaiShangVoxel.transferFrom(address, transferToAddresses[id], id));
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
