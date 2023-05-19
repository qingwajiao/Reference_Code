const {ethers} = require("ethers");
// 将合约部署在 hardhat node 本地链上
const provider = new ethers.providers.JsonRpcProvider();
// 这里我们使用 hardhat node 自带的地址进行签名
const privateKey = `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
const wallet = new ethers.Wallet(privateKey, provider);


const ABI = [ {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "contents",
            "type": "string"
          }
        ],
        "internalType": "struct EIP712Mail.Mail",
        "name": "mail",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "verify",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }]

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contract = new ethers.Contract(contractAddress, ABI, provider);

// 合约连接钱包对象
const contractWithWallet = contract.connect(wallet);

async function sign(Email) {
    // 获取 chainId
    const { chainId } = await provider.getNetwork();

    // 构造 domain 结构体
    // 最后一个地址字段，由于我们在合约中使用了 address(this)
    // 因此需要在部署合约之后，将合约地址粘贴到这里
    const domain = {
        name: 'EIP712Mail',
        version: '1',
        chainId: chainId,
        verifyingContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    };
    // The named list of all type definitions
    // 构造签名结构体类型对象
    const types = {
        Mail: [
            {name: 'from', type: 'address'},
            {name: 'to', type: 'address'},
            {name: 'contents', type: 'string'}
        ]
    };
    // The data to sign
    // 自行构造一个结构体的值
    const value = {
        from: Email.from,
        to: Email.to,
        contents: Email.contents
    };
    const signature = await wallet._signTypedData(
        domain,
        types,
        value
    );

    // 将签名分割成 v r s 的格式
    let signParts = ethers.utils.splitSignature(signature);
    console.log(">>> Signature:", signParts);
    // 打印签名本身
    // console.log(signature);
    // console.log('\n');
    return [signParts.v,signParts.r,signParts.s];

}


async function verify(Email,signer){

    let result = await sign(Email)

    let b = await contractWithWallet.verify(Email,signer,result[0],result[1],result[2])

    console.log("校验的结果:",b);
}


async function main(){
    const Email = {
        from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        contents: 'xyyme'
    };
    let signer = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    verify(Email,signer)
}

main();