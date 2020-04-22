import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import Modal from 'antd/es/modal';
import Slider from 'antd/es/slider';
import ReactCrop from 'react-image-crop';
import './index.scss';

const MODAL_TITLE = 'Edit image';
const ROTATE_LABEL = 'Rotate';

class ImgCrop extends Component {
  constructor(props) {
    super(props);

    this.hasRotate = props.rotate === true;
    this.state = {
      modalVisible: false,
      src: null,
      crop: {},
      degree: 0,
    };
  }

  /**
   * Upload 组件
   */
  // 渲染 Upload 组件
  renderUpload = () => {
    const { children } = this.props;
    const uploadComponent = Array.isArray(children) ? children[0] : children;

    if (this.newUploadProps === undefined) {
      const { accept = 'image/*', beforeUpload = () => true } = uploadComponent.props;
      this.realBeforeUpload = beforeUpload;

      this.newUploadProps = { accept, beforeUpload: this.beforeUpload };
    }

    return {
      ...uploadComponent,
      props: {
        ...uploadComponent.props,
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

      this.oldFile = file;

      // 读取添加的图片
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.setState({ modalVisible: true, src: reader.result });
      });
      reader.readAsDataURL(file); // then -> `onImageLoaded`
    });
  };

  /**
   * ReactCrop 组件
   */
  // 完成添加图片
  onImageLoaded = (image) => {
    if (this.image !== undefined) return;

    this.image = image;

    // real** 实际大小，show** 显示大小
    const { naturalWidth: realImgWidth, naturalHeight: realImgHeight } = image;
    const { width: realCropWidth, height: realCropHeight, modalWidth } = this.props;

    const cropRate = realCropWidth / realCropHeight;
    const modalBodyWidth = modalWidth - 24 * 2;

    let scale = 1;
    let showImgWidth;
    let showImgHeight;

    let showCropWidth;
    let showCropHeight;

    let showCropX;
    let showCropY;

    let contain;
    if (realCropWidth > realImgWidth || realCropHeight > realImgHeight) {
      contain = true;
    } else {
      contain = this.props.contain;
    }

    // 设置数值大小
    const setNumberData = () => {
      showCropWidth = realCropWidth / scale;
      showCropHeight = realCropHeight / scale;

      showCropX = (showImgWidth - showCropWidth) / 2;
      showCropY = (showImgHeight - showCropHeight) / 2;
    };

    // 设置填充容器
    const setContainData = () => {
      const imgRate = realImgWidth / realImgHeight;

      if (cropRate > imgRate) {
        // 裁剪框宽度大于图片
        showCropWidth = showImgWidth;
        showCropHeight = showCropWidth / cropRate;

        showCropX = 0;
        showCropY = (showImgHeight - showCropHeight) / 2;
      } else {
        // 裁剪框宽度小于图片
        showCropHeight = showImgHeight;
        showCropWidth = showCropHeight * cropRate;

        showCropX = (showImgWidth - showCropWidth) / 2;
        showCropY = 0;
      }
    };

    // 设置数值大小 or 填充容器
    const setCropData = () => {
      contain === true ? setContainData() : setNumberData();
    };

    // 设置裁切相关值
    if (realImgWidth > modalBodyWidth) {
      // 图片宽度大于 Model
      showImgWidth = modalBodyWidth;
      scale = realImgWidth / showImgWidth;
      showImgHeight = realImgHeight / scale;

      this.scale = scale;

      setCropData();
    } else {
      // 图片宽度小于 Model
      showImgWidth = realImgWidth;
      showImgHeight = realImgHeight;

      setCropData();
    }

    this.setState({
      crop: {
        unit: 'px',
        aspect: cropRate,
        width: showCropWidth,
        height: showCropHeight,
        x: showCropX,
        y: showCropY,
      },
    });

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
    let { width: sWidth, height: sHeight } = crop;

    if (!sWidth || !sHeight) {
      this.onClose();
      return;
    }

    // 重绘图片如果其已旋转
    let img = this.image;
    const { degree } = this.state;

    if (this.hasRotate && degree > 0 && degree < 360) {
      const newCanvas = document.createElement('canvas');
      const { naturalWidth, naturalHeight } = img;
      newCanvas.width = naturalWidth;
      newCanvas.height = naturalHeight;
      const newCtx = newCanvas.getContext('2d');

      const halfWidth = naturalWidth / 2;
      const halfHeight = naturalHeight / 2;

      newCtx.translate(halfWidth, halfHeight);
      newCtx.rotate((degree * Math.PI) / 180);
      newCtx.translate(-halfWidth, -halfHeight);

      newCtx.drawImage(img, 0, 0);
      img = newCanvas;
    }

    // 获取裁切后的图片
    let { x: sx, y: sy } = crop;
    const scale = this.scale;
    if (scale !== undefined) {
      sx = sx * scale;
      sy = sy * scale;
      sWidth = sWidth * scale;
      sHeight = sHeight * scale;
    }
    const { width: dWidth, height: dHeight } = this.props;
    const canvas = document.createElement('canvas');
    canvas.width = dWidth;
    canvas.height = dHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

    const { name, type, uid } = this.oldFile;
    canvas.toBlob(async (blob) => {
      const croppedFile = new File([blob], name, { type, lastModified: Date.now() }); // 生成新图片
      croppedFile.uid = uid;

      this.onClose(); // 关闭弹窗
      const response = this.realBeforeUpload(croppedFile, [croppedFile]); // 调用 beforeUpload

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
    this.oldFile = undefined;
    this.image = undefined;
    this.scale = undefined;
    this.setState({
      modalVisible: false,
      crop: {},
      degree: 0,
    });
  };
  // 图片旋转
  onRotate = (degree) => {
    this.setState({ degree });
  };

  render() {
    const { modalTitle, modalWidth, resize, resizeAndDrag, rotateLabel } = this.props;
    const { modalVisible, src, crop, degree } = this.state;

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
                <>
                  <ReactCrop
                    src={src}
                    crop={crop}
                    locked={resize === false}
                    disabled={resizeAndDrag === false}
                    onImageLoaded={this.onImageLoaded}
                    onChange={this.onCropChange}
                    keepSelection
                    imageStyle={{ transform: `rotate(${degree}deg)` }}
                  />
                  {this.hasRotate && (
                    <div className="action">
                      <span className="label">{rotateLabel}</span>
                      <Slider min={0} max={360} value={degree} onChange={this.onRotate} />
                    </div>
                  )}
                </>
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
  contain: PropTypes.bool,
  resize: PropTypes.bool,
  resizeAndDrag: PropTypes.bool,

  modalTitle: PropTypes.string,
  modalWidth: PropTypes.number,
  beforeCrop: PropTypes.func,

  rotate: PropTypes.bool,
  rotateLabel: PropTypes.string,

  children: PropTypes.node,
};

ImgCrop.defaultProps = {
  width: 100,
  height: 100,
  contain: false,
  resize: true,
  resizeAndDrag: true,

  modalTitle: MODAL_TITLE,
  modalWidth: 520,

  rotate: false,
  rotateLabel: ROTATE_LABEL,
};

export default ImgCrop;
