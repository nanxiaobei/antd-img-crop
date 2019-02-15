import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop, { getPixelCrop } from 'react-image-crop';
import { Modal } from 'antd';
import './index.scss';

// 修复IE中 canvas.toBlob() 报错
import 'canvas-toBlob';

// 修复IE中 new File() 报错
try {
  new File([], '');
} catch (e) {
  /* eslint-disable-next-line */
  File = class File extends Blob {
    constructor(chunks, filename, opts = {}) {
      super(chunks, opts);
      this.lastModifiedDate = new Date();
      this.lastModified = +this.lastModifiedDate;
      this.name = filename;
    }
  };
}

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
const getCropValues = (naturalWidth, naturalHeight, scaleRatio, aspect) => {
  // 注意，此处 width, height, x, y 均为百分比的值，如 "width: 80"，即为占比 "80%"
  // @link: https://github.com/DominicTobias/react-image-crop#crop-required
  const width = ((naturalHeight * scaleRatio * aspect) / naturalWidth) * 100;
  const height = ((naturalHeight * scaleRatio) / naturalHeight) * 100;
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
    // Bind `this`
    this.beforeUpload = this.beforeUpload.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onCropChange = this.onCropChange.bind(this);
    this.onOk = this.onOk.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  /**
   * Upload 组件
   */
  // 渲染 Upload 组件
  renderChildren() {
    const { children } = this.props;
    this.Upload = children;

    let lengthErr = false;
    if (Array.isArray(children)) {
      this.Upload = children[0];
      if (children.length > 1) lengthErr = true;
    }
    if (lengthErr || !this.Upload.type.defaultProps.beforeUpload) {
      throw new Error('`children` to `ImgCrop` must be only `Upload`');
    }

    const { accept } = this.Upload.props;
    return {
      ...this.Upload,
      props: {
        ...this.Upload.props,
        accept: !accept ? 'image/*' : accept,
        beforeUpload: this.beforeUpload,
      },
    };
  }
  // 格式化 beforeUpload 属性
  beforeUpload(file, fileList) {
    return new Promise(async (resolve, reject) => {
      this.oldFile = file;
      this.resolve = resolve;

      const { beforeUpload } = this.Upload.props;
      const result = beforeUpload(file, fileList);
      if (!result) return false;

      if (result.then) {
        try {
          const resolved = await result;
          const type = Object.prototype.toString.call(resolved);
          if (type === '[object File]' || type === '[object Blob]') this.oldFile = resolved;
        } catch (err) {
          return reject(err);
        }
      }

      // 读取添加的图片
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.setState({ modalVisible: true, src: reader.result });
      });
      reader.readAsDataURL(this.oldFile); // then -> `onImageLoaded`
    });
  }

  /**
   * ReactCrop 组件
   */
  // 完成添加图片
  onImageLoaded(image) {
    this.imageRef = image;
    const { scale } = this.props;

    const { naturalWidth, naturalHeight } = this.imageRef;
    const modalWidth = naturalWidth >= naturalHeight ? 640 + 24 * 2 : 320 + 24 * 2;

    let scaleRatio = scale / 100;
    let { x, y, width, height } = getCropValues(
      naturalWidth,
      naturalHeight,
      scaleRatio,
      this.aspect,
    );
    while (width > scale || height > scale) {
      scaleRatio -= 0.02;
      ({ x, y, width, height } = getCropValues(
        naturalWidth,
        naturalHeight,
        scaleRatio,
        this.aspect,
      ));
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
      this.resolve(newFile);
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
