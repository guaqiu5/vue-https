<template>
  <div :class="{ bigedge: status, smalledge: !status }" id="edge">
    <div
      class="tagbar"
      @mousedown.self="mousedown($event)"
      @mouseup.self="mouseup($event)"
    >
      <div class="lefttag">
        <div class="imgbox">
          <img src="../assets/icons/edge.png" alt="" />
        </div>
        <div class="tag">
          New Tab<span style="float: right; font-weight: bold">×</span>
        </div>
      </div>
      <div class="righttag">
        <div @click="close">-</div>
        <div @click="bigorsmall">▢</div>
        <div @click="close">×</div>
      </div>
    </div>
    <div class="addressbar">
      <div class="back" @click="back">
        <img src="../assets/ui/left.png" alt="" />
      </div>
      <div class="push" @click="push">
        <img src="../assets/ui/right.png" alt="" />
      </div>
      <div class="refresh" @click="refresh">
        <img src="../assets/ui/refresh.png" alt="" />
      </div>
      <div class="address">
        <input type="text" v-model="addressValue" />
      </div>
      <div class="to" @click="toNewAddress">
        <img src="../assets/ui/arrowRight.png" alt="" />
      </div>
      <div class="dian">
        <img src="../assets/ui/threedian.png" alt="" />
      </div>
    </div>
    <div class="collectbar">
      <div
        v-for="(item, index) in address"
        :key="index"
        class="web"
        @click="totagweb(index)"
      >
        <img :src="item.icon" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="content">
      <iframe
        :src="thisAddress"
        frameborder="0"
        width="100%"
        height="100%"
        id="myweb"
      ></iframe>
    </div>
    <Client :requestUrl="addressValue"></Client>
  </div>
</template>
<script>
import Client from "./Client.vue";
export default {
  components: {
    Client,
  },
  data() {
    return {
      address: [
        { name: "哔哩哔哩", icon: "https://www.bilibili.com/favicon.ico" },
        { name: "力扣", icon: "https://leetcode-cn.com/favicon.ico" },
        { name: "掘金", icon: "https://juejin.cn/favicon.ico" },
        { name: "菜鸟教程", icon: "https://www.runoob.com/favicon.ico" },
        { name: "淘宝", icon: "https://www.taobao.com/favicon.ico" },
      ],
      lastAddress: [],
      nextAddress: [],
      thisAddress: "https://juejin.cn/",
      addressValue: "https://juejin.cn/",
      status: true,
    };
  },
  methods: {
    mouseup(e) {
      document.onmousemove = null;
    },
    mousedown(event) {
      var event = event || window.event;
      var _target = document.querySelector("#edge");
      console.log(_target);
      var startx = event.clientX;
      var starty = event.clientY;
      var sb_bkx = startx - _target.offsetLeft;
      var sb_bky = starty - _target.offsetTop;
      var ww = document.documentElement.clientWidth;
      var wh = window.innerHeight;
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    },
    bigorsmall() {
      this.status = !this.status;
    },
    toNewAddress() {
      this.lastAddress.push(this.thisAddress);
      this.thisAddress = this.addressValue;
    },
    refresh() {
      let item = this.thisAddress;
      this.thisAddress = "";
      setTimeout(() => {
        this.thisAddress = item;
      }, 1);
    },
    push() {
      if (this.nextAddress.length >= 1) {
        this.lastAddress.push(this.thisAddress);
        this.thisAddress = this.nextAddress[this.nextAddress.length - 1];
        this.addressValue = this.nextAddress[this.nextAddress.length - 1];
        this.nextAddress.pop();
      }
    },
    back() {
      if (this.lastAddress.length >= 1) {
        this.nextAddress.push(this.thisAddress);
        this.thisAddress = this.lastAddress[this.lastAddress.length - 1];
        this.addressValue = this.lastAddress[this.lastAddress.length - 1];
        this.lastAddress.pop();
      }
    },
    totagweb(index) {
      this.lastAddress.push(this.thisAddress);
      if (index == 0) {
        this.thisAddress = "https://www.bilibili.com/";
        this.addressValue = "https://www.bilibili.com/";
      } else if (index == 1) {
        this.thisAddress = "https://leetcode-cn.com/";
        this.addressValue = "https://leetcode-cn.com/";
      } else if (index == 2) {
        this.thisAddress = "https://juejin.cn/";
        this.addressValue = "https://juejin.cn/";
      } else if (index == 3) {
        this.thisAddress = "https://www.runoob.com/";
        this.addressValue = "https://www.runoob.com/";
      } else if (index == 4) {
        this.thisAddress = "https://www.taobao.com/";
        this.addressValue = "https://www.taobao.com/";
      }
    },
    close() {
      alert("不让你关");
    },
  },
};
</script>

<style lang="scss">
.bigedge {
  transition: all 0.1s ease;
  position: absolute;
  top: 0;
  background-color: white;
  width: 100%;
  height: 100%;
  .tagbar {
    width: 100%;
    height: 32px;
    display: flex;
    justify-content: space-between;
    background-color: rgb(236, 229, 229);
    .lefttag {
      display: flex;
      align-items: center;
      .imgbox {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 45px;
        height: 32px;
        img {
          width: 20px;
          height: 20px;
        }
      }
      .tag {
        width: 220px;
        height: 32px;
        font-size: 15px;
        line-height: 20px;
        padding: 8px;
        background-color: white;
        border-radius: 3px;
      }
    }
    .righttag {
      display: flex;
      align-items: center;
      div {
        font-weight: bold;
        line-height: 32px;
        width: 32px;
        height: 32px;
        text-align: center;
        &:hover {
          background-color: rgb(223, 219, 219);
        }
      }
    }
  }
  .addressbar {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .back {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 10px;
      img {
        width: 20px;
        height: 20px;
      }
      &:hover {
        background-color: rgba($color: #ece8e8, $alpha: 1);
      }
    }
    .push {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      margin: 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
      }
      &:hover {
        background-color: rgba($color: #ece8e8, $alpha: 1);
      }
    }
    .refresh {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      margin: 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
      }
      &:hover {
        background-color: rgba($color: #ece8e8, $alpha: 1);
      }
    }
    .address {
      display: flex;
      align-items: center;
      height: 100%;
      flex: 1;
      input {
        border-radius: 10px;
        width: 100%;
        height: 30px;
        padding: 0 10px;
      }
    }
    .to {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      margin: 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
      }
      &:hover {
        background-color: rgba($color: #ece8e8, $alpha: 1);
      }
    }
    .dian {
      width: 20px;
      height: 100%;
      margin: 0 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 100%;
        height: 20px;
      }
    }
  }
  .collectbar {
    width: 100%;
    height: 26px;
    display: flex;
    align-items: center;
    padding-bottom: 5px;
    .web {
      border-radius: 5px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      img {
        width: 26px;
        height: 26px;
        padding: 5px;
      }
      &:hover {
        background-color: rgba($color: #ece8e8, $alpha: 1);
      }
    }
  }
  .content {
    background-color: black;
    width: 100%;
    height: calc(94vh - 26px - 50px - 32px);
  }
}
.smalledge {
  @extend .bigedge;
  transform: scale(0.6);
  overflow: hidden;
}
</style>
