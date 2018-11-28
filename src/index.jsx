import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import { Modal } from 'antd';
import './index.scss';

const checkNumber = (obj) => {
  Object.entries(obj).forEach(([name, value]) => {
    if (typeof value === 'number') return;
    throw new Error(`\`${name}\` prop to \`ImgCrop\` must be a number`);
  });
};

class ImgCrop extends Component {
  constructor(props) {
    super(props);
    const { width = 100, height = 100 } = props;
    checkNumber({ width, height });

    this.aspect = width / height;
    this.initState = {
      // Modal
      modalVisible: false,
      modalWidth: 520,
      // ReactCrop
      src: null,
      crop: {},
      pixelCrop: {},
    };
    this.state = this.initState;
  }
  /**
   * Upload 组件
   */
    // 渲染 Upload 组件
  renderChildren = () => {
    const { children } = this.props;
    if (children.type.defaultProps.prefixCls !== 'ant-upload') {
      throw new Error('`children` to `ImgCrop` must be `Upload`');
    }
    const props = {
      ...children.props,
      beforeUpload: this.beforeUpload,
    };
    return { ...children, props };
  };
  // 格式化 beforeUpload 属性
  beforeUpload = (file) => {
    this.oldFile = file;

    // 读取添加的图片
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.setState({
        modalVisible: true,
        src: reader.result,
      });
    });
    reader.readAsDataURL(this.oldFile); // then -> `onImageLoaded`

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  };
  /**
   * ReactCrop 组件
   */
    // 完成添加图片
  onImageLoaded = (image) => {
    this.imageRef = image;
    const { width: imageWidth, height: imageHeight } = this.imageRef;

    let ratio = 0.9;
    let { x, y, width, height } = this.getCropValues(imageWidth, imageHeight, ratio);
    while (width > 90 || height > 90) {
      ratio -= 0.02;
      ({ x, y, width, height } = this.getCropValues(imageWidth, imageHeight, ratio));
    }

    this.setState({
      modalWidth: imageWidth >= imageHeight ? 640 : 360,
      crop: { aspect: this.aspect, x, y, width, height },
    });
  };
  // 获取 crop 的值
  getCropValues = (imageWidth, imageHeight, ratio) => {
    // 注意，此处 width, height, x, y 均为百分比的值，如 "width: 80"，即为占比 "80%"
    // @link: https://github.com/DominicTobias/react-image-crop#crop-required
    const width = ((imageHeight * ratio * this.aspect) / imageWidth) * 100;
    const height = ((imageHeight * ratio) / imageHeight) * 100;
    const x = ((imageWidth * (1 - width / 100)) / 2 / imageWidth) * 100;
    const y = ((imageHeight * (1 - height / 100)) / 2 / imageHeight) * 100;

    return { x, y, width, height };
  };
  // 响应裁切变化
  onCropChange = (crop, pixelCrop) => {
    this.setState({ crop, pixelCrop });
  };
  /**
   * Modal 组件
   */
    // 点击确定
  onOk = async () => {
    const { pixelCrop } = this.state;
    const { x, y, width, height } = pixelCrop;

    // 获取裁切后的图片
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.imageRef, x, y, width, height, 0, 0, width, height);

    const { name, type, uid } = this.oldFile;

    canvas.toBlob(async (blob) => {
      // 生成新图片
      const newFile = new File([blob], name, { type, lastModified: Date.now() });
      newFile.uid = uid;

      this.setState(this.initState);

      const { children } = this.props;
      const { beforeUpload } = children.props;
      if (!beforeUpload) {
        this.resolve(newFile);
      } else {
        const before = beforeUpload(newFile, [newFile]);
        if (before) {
          if (!before.then) {
            this.resolve(newFile);
          } else {
            const processedFile = await before;
            const fileType = Object.prototype.toString.call(processedFile);
            if (fileType === '[object File]' || fileType === '[object Blob]') {
              this.resolve(processedFile);
            } else {
              this.resolve(newFile);
            }
          }
        } else {
          this.reject();
        }
      }
    }, type);
  };
  // 取消弹窗
  onCancel = () => {
    this.setState(this.initState);
  };

  render() {
    const { modalVisible, modalWidth, src, crop } = this.state;
    return (
      <>
        {this.renderChildren()}
        <Modal
          visible={modalVisible}
          width={modalWidth}
          onOk={this.onOk}
          onCancel={this.onCancel}
          wrapClassName="antd-img-crop-modal"
          title="编辑图片"
          maskClosable={false}
        >
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              onImageLoaded={this.onImageLoaded}
              onChange={this.onCropChange}
            />
          )}
        </Modal>
      </>
    );
  }
}

export default ImgCrop;
