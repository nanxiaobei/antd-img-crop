import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';
import { Modal } from 'antd';
import './index.scss';

// 兼容 IE
import 'canvas-toBlob';

// 兼容 IE new File()
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

class ImgCrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      src: null,
      crop: {},
    };
  }

  /**
   * Upload 组件
   */
  // 渲染 Upload 组件
  renderUpload = () => {
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
  };
  // 格式化 beforeUpload 属性
  beforeUpload = (file, fileList) => {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      // 裁剪前校验图片
      const { beforeCrop } = this.props;
      if (beforeCrop && !beforeCrop(file, fileList)) {
        this.reject();
        return;
      }

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
    });
  };

  /**
   * ReactCrop 组件
   */
  // 完成添加图片
  onImageLoaded = (image) => {
    const { modalWidth, width, height } = this.props;
    const modalBodyWidth = modalWidth - 24 * 2;

    this.imageRef = image;
    const { naturalWidth, naturalHeight } = this.imageRef;

    let imgWidth = naturalWidth;
    let imgHeight = naturalHeight;

    if (naturalWidth > modalBodyWidth) {
      imgWidth = modalBodyWidth;
      this.scale = naturalWidth / imgWidth;
      imgHeight = naturalHeight / this.scale;
    }

    const aspect = width / height;
    const x = (imgWidth - width) / 2;
    const y = (imgHeight - height) / 2;

    this.setState({ crop: { aspect, x, y, width, height } });
  };
  // 响应裁切变化
  onCropChange = (crop) => {
    this.setState({ crop });
  };

  /**
   * Modal 组件
   */
  // 点击确定
  onOk = async () => {
    const { crop } = this.state;
    let { x, y, width, height } = crop;

    if (this.scale !== undefined) {
      x = x * this.scale;
      y = y * this.scale;
      width = width * this.scale;
      height = height * this.scale;
    }

    // 获取裁切后的图片
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.imageRef, x, y, width, height, 0, 0, width, height);

    const { name, type, uid } = this.oldFile;

    canvas.toBlob(async (blob) => {
      // 生成新图片
      const croppedFile = new File([blob], name, {
        type,
        lastModified: Date.now(),
      });
      croppedFile.uid = uid;
      // 关闭弹窗
      this.onClose();

      const { beforeUpload } = this.Upload.props;
      if (!beforeUpload) {
        this.resolve(croppedFile);
        return;
      }

      const result = beforeUpload(croppedFile, [croppedFile]);
      if (!result) {
        this.reject();
        return;
      }

      if (!result.then) {
        this.resolve(croppedFile);
        return;
      }

      try {
        const resolvedFile = await result;
        const fileType = Object.prototype.toString.call(resolvedFile);
        if (fileType === '[object File]' || fileType === '[object Blob]') {
          this.resolve(resolvedFile);
        } else {
          this.resolve(croppedFile);
        }
      } catch (err) {
        this.reject(err);
      }
    }, type);
  };
  // 关闭弹窗
  onClose = () => {
    this.setState({
      modalVisible: false,
      src: null,
      crop: {},
    });
  };

  render() {
    const { modalTitle, modalWidth, resize, resizeAndDrag } = this.props;
    const { modalVisible, src, crop } = this.state;

    return (
      <>
        {this.renderUpload()}
        <Modal
          visible={modalVisible}
          width={modalWidth}
          onOk={this.onOk}
          onCancel={this.onClose}
          wrapClassName="antd-img-crop-modal"
          title={modalTitle}
          maskClosable={false}
        >
          {src && (
            <ReactCrop
              src={src}
              crop={crop}
              locked={resize === false}
              disabled={resizeAndDrag === false}
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
  beforeCrop: PropTypes.func,
  modalTitle: PropTypes.string,
  modalWidth: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  resize: PropTypes.bool,
  resizeAndDrag: PropTypes.bool,
  children: PropTypes.node,
};

ImgCrop.defaultProps = {
  modalTitle: '编辑图片',
  modalWidth: 520,
  width: 100,
  height: 100,
  resize: true,
  resizeAndDrag: true,
};

export default ImgCrop;
