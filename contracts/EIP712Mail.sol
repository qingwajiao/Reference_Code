pragma solidity 0.8.10;

contract EIP712Mail {
    // Mail 是待签名的结构体
    struct Mail {
        address from;
        address to;
        string contents;
    }

    struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

     // 签名对象哈希
    bytes32 internal constant TYPE_HASH = keccak256(
        "Mail(address from,address to,string contents)"
    );

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            // 计算 DOMAIN_SEPARATOR 哈希
            // 这里的 name 为 EIP712Mail，即合约名
            // version 为 1
            abi.encode(
                EIP712DOMAIN_TYPEHASH,
                keccak256("EIP712Mail"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

     // 计算待签名的结构体的哈希
    function hashStruct(Mail memory mail) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                TYPE_HASH,
                mail.from,
                mail.to,
                keccak256(bytes(mail.contents))
            )
        );
    }

    function verify(Mail memory mail, address signer, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {

    // Note: we need to use `encodePacked` here instead of `encode`.
    // 这里是固定格式，套用即可
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashStruct(mail)
    ));
    
    return ecrecover(digest, v, r, s) == signer;
    
}
}