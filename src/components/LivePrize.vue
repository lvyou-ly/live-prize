<template>
  <div class="live-prize">
    <canvas id="prize-canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <img
      :src="iconList[activeIcon]"
      alt
      :style="{'width': `${iconWidth}px`, 'height': `${iconHeight}px`}"
      class="icon"
      @click="start"
    />
  </div>
</template>
<script>
export default {
  props: {
    iconWidth: {
      type: Number,
      default: 50,
    },
    iconHeight: {
      type: Number,
      default: 50,
    },
    canvasWidth: {
      type: Number,
      default: 200,
    },
    canvasHeight: {
      type: Number,
      default: 400,
    },
    activeIcon: {
      type: Number,
      default: 0,
    },
    iconList: {
      type: Array,
      required: true,
    },
    scaleTime: {
      type: Number,
      default: 0.1,
      validator: (value) => {
        return value > 0 && value < 1;
      },
    },
  },
  data() {
    return {
      // 渲染列表
      renderList: [],
      // 渲染上下文
      context: null,
      privateIconList: null,
      scanning: false,
      imageWidth: 50,
      imageHeight: 50,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const canvas = document.querySelector("#prize-canvas");
      this.context = canvas.getContext("2d");
      this.loadImages();
    },
    loadImages() {
      let promiseAll = [];
      for (let i = 0; i < this.iconList.length; i++) {
        let p = new Promise((resolve) => {
          const image = new Image();
          image.src = this.iconList[i];
          image.onload = resolve.bind(null, image);
          promiseAll.push(image);
        });
      }
      Promise.all(promiseAll)
        .then((imageList) => {
          this.privateIconList = imageList.filter((item) => item && item.width);
          if (this.privateIconList.length === 0) {
            throw new Error("all the images load fail");
          }
        })
        .catch((e) => {
          console.log("catch error:", e);
        });
    },
    createRender() {
      if (this.privateIconList.length === 0) {
        return null;
      }
      // 计算缩放，可根据需求随意设置缩放比例
      const basicScale = [0.6, 0.8, 1.2][this.getRandom(0, 2)];
      // currentTime 是当前时间占缩放动画总时间的比例
      const getScale = (currentTime) => {
        if (currentTime >= this.scaleTime) {
          return basicScale;
        }
        return (currentTime / this.scaleTime).toFixed(2) * basicScale;
      };
      // 从图片列表中随机抽取一张
      const image = this.privateIconList[
        Math.floor(this.getRandom(0, this.privateIconList.length - 1))
			];
			image.width = this.imageWidth;
			image.height = this.imageHeight;
      const getImageSize = (currentTime) => {
				let imageWidth = this.imageWidth, imageHeight = this.imageHeight;
				if (currentTime < this.scaleTime) {
					imageWidth = Math.floor((currentTime / this.scaleTime) * this.imageWidth);
					imageHeight = Math.floor((currentTime / this.scaleTime) * this.imageHeight);
				}
				return {
					imageWidth,
					imageHeight,
				}
      };
      // 利用sin曲线作为图片基础轨迹
      const angle = this.getRandom(2, 10);
      // 乘系数，让图片摆动起来
			const ratio = this.getRandom(10, 30) * (this.getRandom(10, 20) > 15 ? 1 : -1);
			const basicX = Math.floor(this.canvasWidth / 2 + ([1, -1][this.getRandom(0,1).toFixed()]) * image.width / 2);
      const getOriginX = (currentTime) => {
        if (currentTime < this.scaleTime) {
          // 放大期间不进行左右摇摆
          return basicX;
        }
        return basicX + ratio * Math.sin(angle * (currentTime - this.scaleTime));
      };
      const getOriginY = (currentTime) => {
      return (
          (1 - currentTime) * (this.canvasHeight - Math.floor(image.height))
        );
      };
      // 计算透明度, opcityTime为缩减透明度的起始时间
      const opcityTime = this.getRandom(0.5, 0.9);
      const getAlpha = (currentTime) => {
        if (currentTime < opcityTime) {
          return 1;
        }
        return 1 - (currentTime - opcityTime) / (1 - opcityTime);
      };
      return (currentTime) => {
        if (currentTime >= 1) return true;
        this.context.save();
				this.context.globalAlpha = getAlpha(currentTime);
        let originX = getOriginX(currentTime);
				let originY = getOriginY(currentTime);
				let imageWidth = getImageSize(currentTime).imageWidth;
				let imageHeight = getImageSize(currentTime).imageHeight;
        this.context.drawImage(
          image,
          originX,
          originY,
          imageWidth,
          imageHeight
        );
        this.context.restore();
      };
    },
    scan() {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context.fillStyle = "#fff";
      let index = 0;
      if (this.renderList.length) {
        this.requestFrame(this.scan.bind(this));
        this.scanning = true;
      } else {
        this.scanning = false;
      }
      while (index < this.renderList.length) {
        if (
          !this.renderList[index] ||
          !this.renderList[index].render ||
          this.renderList[index].render.call(
            null,
            (
              (Date.now() - this.renderList[index].timeStamp) /
              this.renderList[index].duration
            ).toFixed(2)
          )
        ) {
          this.renderList.splice(index, 1);
        } else {
          index++;
        }
      }
    },
    start() {
      const render = this.createRender();
      const duration = Math.floor(this.getRandom(1500, 3000));
      this.renderList.push({
        render,
        duration,
        timeStamp: Date.now(),
      });
      if (!this.scanning) {
        this.scanning = true;
        this.requestFrame(this.scan.bind(this));
      }
    },
    getRandom(start, end) {
      return Math.random() * (end - start) + start;
    },
    requestFrame(callback) {
      window.requestAnimationFrame(callback);
    },
  },
};
</script>
<style lang="scss">
.prize-canvas {
  width: 200px;
  height: 400px;
}
.icon {
  display: block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 460px;
}
</style>