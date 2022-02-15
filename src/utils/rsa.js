import { KJUR, hex2b64, b64tohex, KEYUTIL } from 'jsrsasign'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
// 公钥
let pk = "-----BEGIN PUBLIC KEY-----\n" +
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD3XSdz1MnzazBEN5KOfTx0IyVJ\n" +
    "Z5wb57isrCuHDhnYXwtmdhQalgII0fozeeFpMpAvlnmHC1kpW7XVGvZnLx3bWbCE\n" +
    "bf+pMSW4kmQuI+5cxRUJbCl7sdaODBrINgERHPICVC18AJLThEVMHyjuR6Jn4zQm\n" +
    "yYNbReSktY/BrFTvMQIDAQAB\n" +
    "-----END PUBLIC KEY-----";
// 私钥
let priK = "-----BEGIN PRIVATE KEY-----\n" +
    "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAPddJ3PUyfNrMEQ3\n" +
    "ko59PHQjJUlnnBvnuKysK4cOGdhfC2Z2FBqWAgjR+jN54WkykC+WeYcLWSlbtdUa\n" +
    "9mcvHdtZsIRt/6kxJbiSZC4j7lzFFQlsKXux1o4MGsg2AREc8gJULXwAktOERUwf\n" +
    "KO5HomfjNCbJg1tF5KS1j8GsVO8xAgMBAAECgYEA6eG1JMrj63jEmStmMb1txG1a\n" +
    "mu4Q5z2QGgtr2HVXsIIlGEq6tWxyHf7TL4qkuz9onuYKn8n2Eqm44fZtVaBx+5ES\n" +
    "zRpIvlTvaxmVu0HZ1hYAzUw1XyRnXNMKpL5tT4GCjm8+QGPzlGxgXI1sNg8r9Jaw\n" +
    "9zRUYeA6LQR9RIMkHWUCQQD8QojjVoGjtiunoh/N8iplhUszZIavAEvmDIE+kVy+\n" +
    "pA7hvlukLw6JMc7cfTcnHyxDo9iHVIzrWlTuKRq9KWVLAkEA+wgJS2sgtldnCVn6\n" +
    "tJKFVwsHrWhMIU29msPPbNuWUD23BcKE/vehIyFu1ahNA/TiM40PEnzprQ5JfPxU\n" +
    "16S78wJANTfMLTnYy7Lo7sqTLx2BuD0wqjzw9QZ4/KVytsJv8IAn65P/PVn4FRV+\n" +
    "8KEx+3zmF7b/PT2nJRe/hycAzxtmlQJBAMrFwQxEqpXfoAEzx4lY2ZBn/nmaR/SW\n" +
    "4VNEXCbocVC7qT1j1R5HVMgV13uKiTtq8dUGWmhqsi7x3XayNK5ECPUCQQDZaAN6\n" +
    "tvIHApz9OLsXSw0jZirQ6KEYdharXbIVDy1W1sVE3lzLbqLdFp1bxAHQIvsYS5PM\n" +
    "A9veSJh372RLJKkj\n" +
    "-----END PRIVATE KEY-----";

export default {
    // 加密
    encrypt(src) {

        // 读取解析pem格式的秘钥, 生成秘钥实例 (RSAKey) 
        if (typeof src == 'number') src = src + ''
        var pub = KEYUTIL.getKey(pk);
        var enc = KJUR.crypto.Cipher.encrypt(src, pub);
        return enc
    },

    // 解密
    decrypt(enc) {
        var prv = KEYUTIL.getKey(priK);
        var dec = KJUR.crypto.Cipher.decrypt(enc, prv);
        return dec;
    },

    // 加签(用自己的私钥对signData进行签名)
    signature(src) {
        // 创建 Signature 对象
        let signature = new KJUR.crypto.Signature({ alg: "SHA1withRSA", prvkeypem: priK }); //!这里指定 私钥 pem!
        signature.updateString(src);
        let a = signature.sign();
        let sign = hex2b64(a);

        return sign

    },

    // 验签 用公钥对签名进行验签
    verify(src, sign) {
        // 验签
        // !要重新new 一个Signature, 否则, 取摘要和签名时取得摘要不一样, 导致验签误报失败(原因不明)!
        let signatureVf = new KJUR.crypto.Signature({ alg: "SHA1withRSA", prvkeypem: pk });
        signatureVf.updateString(src);
        // !接受的参数是16进制字符串!
        let b = signatureVf.verify(b64tohex(sign));
        return b;
    }
}