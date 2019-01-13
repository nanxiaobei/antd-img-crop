import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop, { getPixelCrop } from 'react-image-crop';
import { Modal } from 'antd';
import './index.scss';

const defaultState = {
  // Modal
  modalVisible: false,
  modalWidth: 520,
  // ReactCrop
  src: null,
  crop: {},
  pixelCrop: {},
};
// 获取 crop 的值
const getCropValues = (naturalWidth, naturalHeight, ratio, aspect) => {
  // 注意，此处 width, height, x, y 均为百分比的值，如 "width: 80"，即为占比 "80%"
  // @link: https://github.com/DominicTobias/react-image-crop#crop-required
  const width = ((naturalHeight * ratio * aspect) / naturalWidth) * 100;
  const height = ((naturalHeight * ratio) / naturalHeight) * 100;
  const x = ((naturalWidth * (1 - width / 100)) / 2 / naturalWidth) * 100;
  const y = ((naturalHeight * (1 - height / 100)) / 2 / naturalHeight) * 100;

  return { x, y, width, height };
};

class ImgCrop extends Component {
  constructor(props) {
    super(props);
    const { width, height } = props;
    this.aspect = width / height;
    this.state = defaultState;
  }

  /**
   * Upload 组件
   */
  // 渲染 Upload 组件
  renderChildren() {
    const { children } = this.props;
    this.Upload = children;

    let lengthError = false;
    if (Array.isArray(children)) {
      this.Upload = children[0];
      if (children.length > 1) lengthError = true;
    }
    if (lengthError || this.Upload.type.defaultProps.prefixCls !== 'ant-upload') {
      throw new Error('`children` to `ImgCrop` must be only `Upload`');
    }

    return {
      ...this.Upload,
      props: {
        ...this.Upload.props,
        beforeUpload: this.beforeUpload,
      },
    };
  }
  // 格式化 beforeUpload 属性
  beforeUpload(file) {
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
  }

  /**
   * ReactCrop 组件
   */
  // 完成添加图片
  onImageLoaded(image) {
    const { scale } = this.props;
    this.imageRef = image;
    const { naturalWidth, naturalHeight } = this.imageRef;
    const modalWidth = naturalWidth >= naturalHeight ? 640 + 24 * 2 : 320 + 24 * 2;

    let ratio = scale / 100;
    let { x, y, width, height } = getCropValues(naturalWidth, naturalHeight, ratio, this.aspect);
    while (width > scale || height > scale) {
      ratio -= 0.02;
      ({ x, y, width, height } = getCropValues(naturalWidth, naturalHeight, ratio, this.aspect));
    }

    const crop = { aspect: this.aspect, x, y, width, height };
    const pixelCrop = getPixelCrop(this.imageRef, crop);

    this.setState({ modalWidth, crop, pixelCrop });
  }
  // 响应裁切变化
  onCropChange(crop, pixelCrop) {
    this.setState({ crop, pixelCrop });
  }

  /**
   * Modal 组件
   */
  // 点击确定
  async onOk() {
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

      this.setState(defaultState);

      const { beforeUpload } = this.Upload.props;
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
  }
  // 取消弹窗
  onCancel() {
    this.setState(defaultState);
  }

  render() {
    const { modalTitle } = this.props;
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
          title={modalTitle}
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

ImgCrop.propTypes = {
  modalTitle: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  scale: PropTypes.number,
  children: PropTypes.node,
};

ImgCrop.defaultProps = {
  modalTitle: '编辑图片',
  width: 100,
  height: 100,
  scale: 80,
};

export default ImgCrop;
