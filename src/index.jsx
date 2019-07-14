import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';
import { Modal } from 'antd';
import LocaleReceiver from 'antd/lib/locale-provider/LocaleReceiver';
import './index.scss';

try {
  new File([], '');
} catch (e) {
  // 兼容 IE new File()
  import('canvas-toBlob').then(() => {
    /* eslint-disable-next-line */
    File = class File extends Blob {
      constructor(chunks, filename, opts = {}) {
        super(chunks, opts);
        this.lastModifiedDate = new Date();
        this.lastModified = +this.lastModifiedDate;
        this.name = filename;
      }
    };
  });
}

const MODAL_TITLE = 'Edit image';
const NOT_ONLY_ERR = '`children` to `<ImgCrop />` must be only `<Upload />`';

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

    let Upload;
    if (this.newUploadProps === undefined) {
      if (Array.isArray(children)) {
        if (children.length > 1) throw new Error(NOT_ONLY_ERR);
        Upload = children[0];
      } else {
        Upload = children;
      }
      if (!Upload.type.defaultProps.beforeUpload) throw new Error(NOT_ONLY_ERR);

      const { accept, beforeUpload } = Upload.props;
      this.realBeforeUpload = beforeUpload;

      this.newUploadProps = {
        accept: !accept ? 'image/*' : accept,
        beforeUpload: this.beforeUpload,
      };
    } else {
      Upload = Array.isArray(children) ? children[0] : children;
    }

    return {
      ...Upload,
      props: {
        ...Upload.props,
        ...this.newUploadProps,
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

      this.originalFIle = file;

      // 读取添加的图片
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.setState({
          modalVisible: true,
          src: reader.result,
        });
      });
      reader.readAsDataURL(this.originalFIle); // then -> `onImageLoaded`
    });
  };

  /**
   * ReactCrop 组件
   */
  // 完成添加图片
  onImageLoaded = (image) => {
    if (this.imageRef !== undefined) return;

    this.imageRef = image;
    const { naturalWidth, naturalHeight } = this.imageRef;
    let imgWidth = naturalWidth;
    let imgHeight = naturalHeight;

    const { modalWidth, width: cropWidth, height: cropHeight, useRatio } = this.props;

    const modalBodyWidth = modalWidth - 24 * 2;
    if (naturalWidth > modalBodyWidth) {
      imgWidth = modalBodyWidth;
      this.scale = naturalWidth / imgWidth;
      imgHeight = naturalHeight / this.scale;
    }

    const aspect = cropWidth / cropHeight;
    let x;
    let y;
    let width;
    let height;

    if (useRatio === true) {
      const naturalAspect = naturalWidth / naturalHeight;
      if (naturalAspect > aspect) {
        y = 0;
        height = imgHeight;
        width = height * aspect;
        x = (imgWidth - width) / 2;
      } else {
        x = 0;
        width = imgWidth;
        height = width / aspect;
        y = (imgHeight - height) / 2;
      }
    } else {
      x = (imgWidth - cropWidth) / 2;
      y = (imgHeight - cropHeight) / 2;
      width = cropWidth;
      height = cropHeight;
    }

    this.setState({ crop: { unit: 'px', aspect, x, y, width, height } });
    return false;
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

    if (!width || !height) {
      this.onClose();
      return;
    }

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

    const { name, type, uid } = this.originalFIle;
    canvas.toBlob(async (blob) => {
      // 生成新图片
      const croppedFile = new File([blob], name, { type, lastModified: Date.now() });
      croppedFile.uid = uid;

      // 关闭弹窗
      this.onClose();

      // 调用 beforeUpload
      const response = this.realBeforeUpload(croppedFile, [croppedFile]);

      if (response === false) {
        this.reject();
        return;
      }

      if (typeof response.then !== 'function') {
        this.resolve(croppedFile);
        return;
      }

      try {
        const croppedProcessedFile = await response;
        const fileType = Object.prototype.toString.call(croppedProcessedFile);
        const useProcessedFile = fileType === '[object File]' || fileType === '[object Blob]';

        this.resolve(useProcessedFile ? croppedProcessedFile : croppedFile);
      } catch (err) {
        this.reject(err);
      }
    }, type);
  };
  // 关闭弹窗
  onClose = () => {
    this.imageRef = undefined;
    this.scale = undefined;

    this.setState({
      modalVisible: false,
      crop: {},
    });
  };

  render() {
    const { modalTitle, modalWidth, resize, resizeAndDrag } = this.props;
    const { modalVisible, src, crop } = this.state;

    return (
      <LocaleReceiver>
        {(locale, localeCode) => (
          <>
            {this.renderUpload()}
            <Modal
              visible={modalVisible}
              width={modalWidth}
              onOk={this.onOk}
              onCancel={this.onClose}
              wrapClassName="antd-img-crop-modal"
              title={localeCode === 'zh-cn' && modalTitle === MODAL_TITLE ? '编辑图片' : modalTitle}
              maskClosable={false}
              destroyOnClose
            >
              {src && (
                <ReactCrop
                  src={src}
                  crop={crop}
                  locked={resize === false}
                  disabled={resizeAndDrag === false}
                  onImageLoaded={this.onImageLoaded}
                  onChange={this.onCropChange}
                  keepSelection
                />
              )}
            </Modal>
          </>
        )}
      </LocaleReceiver>
    );
  }
}

ImgCrop.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  useRatio: PropTypes.bool,
  resize: PropTypes.bool,
  resizeAndDrag: PropTypes.bool,

  modalTitle: PropTypes.string,
  modalWidth: PropTypes.number,
  beforeCrop: PropTypes.func,

  children: PropTypes.node,
};

ImgCrop.defaultProps = {
  width: 100,
  height: 100,
  useRatio: false,
  resize: true,
  resizeAndDrag: true,

  modalTitle: MODAL_TITLE,
  modalWidth: 520,
};

export default ImgCrop;
