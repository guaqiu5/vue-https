<template>
  <div>
    <el-form :inline="true">
      <el-form-item label="http请求方式">
        <el-select v-model="httpOption.method" placeholder="http请求方式">
          <el-option label="GET" value="GET"></el-option>
          <el-option label="SET" value="SET"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="httpsConnectionStart">查看https请求</el-button>
      </el-form-item>
    </el-form>
    <Log :msgList="msgList"></Log>
  </div>
</template>

<script>
import Log from "./Log";
import { throttle } from "../utils/throttle.js";
let sha1 = require("js-sha1");
export default {
  components: {
    Log,
  },
  props: ["requestUrl"],

  data() {
    return {
      hasTimeOut: 0, //消息列表里是否有定时器(让消息列表的更新具有延迟)
      logMsgQueue: [], //如果有定时器,消息加到该队列里，没有定时器了再递归增添队首消息 直到队列为空
      isFirstHttpsRequest: true,
      msgList: [], //通信日志消息列表
      tlsVersion: "1.2",
      clientRandom: undefined, //客户端随机数
      serverRandom: undefined, //服务端随机数
      preMaster: undefined, //第三次握手生成的随机数 然后三个随机数加密得到会话密钥
      masterKey: undefined, //会话密钥
      totalMessage: undefined, //第三次握手前的所有报文
      cipherSuites: "RSA_WITH_AES_128_GCM_SHA1", //密码套件
      code: undefined,
      httpOption: {
        method: "",
        url: this.requestUrl,
      },
    };
  },

  methods: {
    //入口函数 节流包裹
    httpsConnectionStart: throttle(function () {
      if (!this.isFirstHttpsRequest) this.msgList = [];
      this.isFirstHttpsRequest = false;
      this.logAppend(`已经记录本次https通信模拟流程 本次请求地址为${this.requestUrl}`);
      this.tlsFirst();
      this.tlsSecond();
      if (this.$store.state.tlsSecond.meta.success) {
        this.tlsThird();
        this.tlsForth();
        this.httpRequest({ method: this.httpOption.method, url: this.requestUrl });
        this.msgList = [];
      } else return;
    }, 1000),
    toNewAddress() {
      this.httpsConnectionStart();
      this.$emit("toNewAddress");
    },
    //tls-first handshake
    tlsFirst() {
      this.clientRandom = this.$random.createRandom();
      //客户端发起第一次🤝,将version,random等信息提交给服务端
      this.$store.commit("tlsFirst", {
        version: this.tlsVersion,
        random: this.clientRandom,
      });
      this.logAppend("客户端发起第一次tls🤝成功!提供serverRandom,密码套件,tls版本信息");
    },

    //tls-second handshake
    tlsSecond() {
      //服务端发起第二次🤝,state存储报文信息
      this.$store.commit("tlsSecond");
      this.serverRandom = this.$store.state.serverRandom;
      this.totalMessage = this.$store.state.totalMessage;
      this.logAppend(this.$store.state.tlsSecond.meta.msg);
    },

    //tls-third handshake
    tlsThird() {
      //检查证书是否有效
      //--浏览器同样的算法(sha1)对dc进行加密得到h1
      const h1 = sha1(this.$store.state.tlsSecond.data.dcInfo);
      //--再用公🔑解签
      const h2 = this.$store.state.tlsSecond.data.cryptographicDcHash;
      //-- 如果h1==h2 证书有效🐶
      const isValid = this.$rsa.verify(h1, h2);
      if (isValid) {
        this.logAppend("客户端收到服务端第二次握手的信息,经验证数字证书有效");
      } else {
        this.logAppend("数字证书无效");
        throw new Error("数字证书无效");
      }
      //证书信任链 --为了根证书不轻易失守,一层层的来请求得到根证书
      //-- 伪代码:while(currentDc.颁布者!=null){
      //currentCa=requestPreCa(currentDc.颁布者) //向当前证书签发机构请求上一级的数字证书
      //    }
      //if(currentDc.颁布者==信任的根CA机构){证书可信任}

      //如果证书有效且信任那客户端就准备第三次🤝
      this.preMaster = this.$random.createRandom();
      //rsa公🔑加密preMaster 等会发给服务端
      const enc = this.$rsa.encrypt(this.preMaster);
      //生成会话密钥masterkey(三个随机数随便找个加密算法加密 按照密码套件应该用aes对称🔐 这里还是用sha1模拟一下)
      const rawMasterKey = this.serverRandom + this.clientRandom + this.preMaster;
      const masterKey = sha1(rawMasterKey);
      this.masterKey = masterKey;
      //生成会话密钥加密的🤝信息
      const encryptHandShakeMsg = sha1(this.totalMessage + masterKey);
      //开始加密交流
      const changeCipherSpec = true;
      //开始第三次🤝
      this.logAppend(
        "客户端发起第三次🤝,发送公🔑加密过的第三个随机数和用会话密钥加密过的🤝信息摘要"
      );
      this.$store.commit("tlsThird", {
        enc,
        encryptHandShakeMsg,
        changeCipherSpec,
      });
      if (this.$store.state.tlsThird.meta.success) {
        this.logAppend(this.$store.state.tlsThird.meta.msg);
      } else {
        throw new Error(this.$store.state.tlsThird.meta.msg);
      }
    },
    tlsForth() {
      this.$store.commit("tlsForth");
      this.logAppend(
        "客户端收到服务端第四次🤝报文(握手信息摘要和开始加密通信) 下面可以开始进行加密的http通信"
      );
    },
    httpRequest(httpRequestOption) {
      //根据option生成http报文（转成json字符串）再加上 会话密钥  再进行rsa公钥加密
      const httpRequestMsg = JSON.stringify(httpRequestOption);
      const _httpRequestMsg = httpRequestMsg + this.masterKey;
      const sendHttpRequestMsg = this.$rsa.encrypt(_httpRequestMsg);
      //发送http请求
      this.$store.commit("http", sendHttpRequestMsg);
      this.logAppend("客户端已经发送加密的http请求");
      this.logAppend(this.$store.state.httpResponse.msg);
    },
    logAppend(msg) {
      //没有定时器,那就说明之前消息列表全部更新完了或者首次更新
      //设置一个2s的定时器,结束后执行消息列表更新
      //定时器存在期间会有消息列表更新请求,定时任务完成后再递归执行阻塞队列里的任务
      //递归结束条件:阻塞队列为空
      if (!this.hasTimeOut) {
        this.hasTimeOut = setTimeout(() => {
          this.msgList.push(msg);
          this.hasTimeOut = 0;
          if (this.logMsgQueue.length > 0) {
            let _msg = this.logMsgQueue.shift();
            this.logAppend(_msg);
          }
        }, 2000);
      } else {
        //有定时器 得等待定时任务执行完成,入队到阻塞队列中
        this.logMsgQueue.push(msg);
      }
    },
  },
};
</script>

<style style lang="scss"></style>
