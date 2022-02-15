import Vue from 'vue'
import Vuex from 'vuex'
let sha1 = require("js-sha1")
Vue.use(Vuex)
import rsa from '../utils/rsa'
import random from '../utils/random'

export default new Vuex.Store({
    state: {
        hasHttpsRequest: false,
        //服务端支持的tsl版本
        versionMatch: {
            '1.2': true
        },
        cipherSuite: 'RSA_WITH_AES_128_GCM_SHA1', //为了模拟方便,密码套件写死为这种(写全🦈了我ba)
        clientVersion: undefined, //客户端的tsl版本
        clientRandom: undefined, //tls第一次握手客户端传来的随机数 
        serverRandom: undefined, //tls第二次握手服务端产生的随机数
        //tls第二次握手服务端给客户端的报文
        tlsSecond: {
            meta: { success: undefined, msg: '' },
            data: {
                dcInfo: '公钥,持有者信息,用途,有效期等', //数字证书 这里摘要就随便写写
                dcHash: '', //数字证书的hash值(ca对数字证书的信息进行哈希计算 密码套件用的SHA256)
                cryptographicDcHash: '', //ca用自己私🔑加签 生成数字签名
            },

        },
        tlsThird: {
            meta: {
                success: undefined,
                msg: '',
            }
        },
        //模拟下tls握手产生的报文,客户端用摘要算法将报文变成hash和会话密钥(三个随机数rsa加密后)的结果给服务端
        //然后服务端再将本地的报文变成hash 再通过得到的rsa🔐的preMaster生成会话密钥 第四次🤝判断两者是否相同 
        totalMessage: undefined,
        masterKey: undefined,
        changeCipherSpec: undefined,
        encryptHandShakeMsg: undefined,
        httpResponse: {
            code: undefined,
            method: undefined,
            msg: '',
        }
    },
    mutations: {

        //tls客户端第一次握手后 服务端接受客户端发送的tls版本号,随机数等参数,服务端进行保存
        tlsFirst(state, { version, random }) {
            state.clientRandom = random
            state.clientVersion = version
        },

        //tls服务端发起第二次握手,判断是否支持客户端的tls版本,并将证书交给客户端
        tlsSecond(state) {
            if (state.versionMatch[state.clientVersion]) {
                state.tlsSecond.meta.success = true //说明服务端支持客户端的tls版本
                state.serverRandom = random.createRandom() //生成服务端随机数
                state.tlsSecond.meta.msg = '服务端收到第一次🤝,支持该browser的tls版本,分配密码套件RSA_WITH_AES_128_GCM_SHA1 发起第二次握手 发送数字签名,公🔑等相关信息'
                state.tlsSecond.data.dcInfo = 'fake_dcinfofefesfsdscsvfdwfwfwf的草地上厕所' //ca(证书认证机构)签发数字签名
                state.tlsSecond.data.dcHash = sha1(state.tlsSecond.data.dcInfo) //sha1摘要算法加密dcInfo
                state.tlsSecond.data.cryptographicDcHash = rsa.signature(state.tlsSecond.data.dcHash) // ca的私钥加签hash
                state.totalMessage = 'ByteDance666'
            } else {
                //说明不支持 中止🤝
                state.tlsSecond.meta.sucess = false
                state.tlsSecond.meta.msg = '服务端不支持browser的tls版本'
            }

        },
        tlsThird(state, { enc, encryptHandShakeMsg, changeCipherSpec }) {
            //将totalMsg sha1摘要hash 
            const hashTotalMsg = sha1(state.totalMessage)
                //私🔑解密enc 得到preMaster 然后再得到没有🔐的rawMasterKey,然后再🔐得到MasterKey
            const preMaster = parseInt(rsa.decrypt(enc))
            const rawMasterKey = state.clientRandom + state.serverRandom + preMaster
            const masterKey = sha1(rawMasterKey)
            state.masterKey = masterKey
            state.encryptHandShakeMsg = sha1(state.totalMessage + masterKey)
                //判断 totalMsgHash+MasterKey是否与客户端发来的encryptHandShakeMsg相同 确保握手信息未被篡改
            if (state.encryptHandShakeMsg == encryptHandShakeMsg) {
                state.tlsThird.meta.success = true
                state.tlsThird.meta.msg = '服务端收到第三次🤝信息 之前的🤝信息未被篡改 咱们可以说别人看不懂的http了！'
            } else {
                state.tlsThird.meta.success = false
                state.tlsThird.meta.msg = '服务端收到第三次🤝信息 之前的🤝信息可能被篡改 终止通信'
            }
        },
        tlsForth(state) {
            //第四次🤝也发会话密钥加密后的🤝信息和 可以开始说别人看不懂的http了
            state.changeCipherSpec = true
        },
        http(state, payload) {
            //先解密
            let msg = rsa.decrypt(payload)
                //删去没用的会话密钥就是报文内容

            const masterKeyIndex = msg.indexOf(state.masterKey)

            msg = msg.split('')

            msg.splice(masterKeyIndex, state.masterKey.length)
                //转换为js对象
            msg = msg.join('')
            const { method, url } = JSON.parse(msg)
            if (url == 'https://juejin.cn/') {
                console.log('1')
                state.httpResponse.code = '200'
                state.httpResponse.method = method
                state.httpResponse.msg = `服务端返回资源成功,状态码${state.httpResponse.code},收到的请求方式${state.httpResponse.method}`
            } else {
                state.httpResponse.code = '404'
                state.httpResponse.msg = '只设置了https://juejin.cn/这个资源 换到掘金就正常喽 给你个状态码404 '
            }
            //服务端的报文也要用会话密钥进行一系列加密... 就到这告段落

        }
    },
    actions: {},
    modules: {}
})