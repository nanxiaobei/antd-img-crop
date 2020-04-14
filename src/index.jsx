import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import Modal from 'antd/es/modal';
import Slider from 'antd/es/slider';
import Col from 'antd/es/col';
import Row from 'antd/es/row';
import ReactCrop from 'react-image-crop';

import 'antd/es/modal/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/slider/style/index.css';
import 'antd/es/grid/style/index.css';
import './index.scss';

const MODAL_TITLE = 'Edit image';
const ZOOM_TITLE = 'Zoom';
const ROTATION_TITLE = 'Rotation';

class ImgCrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      src: null,
      crop: {},
      rotationDegree: 0,
      zoomScale: 1,
      imageTranslateX: 0,
      imageTranslateY: 0,
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

    // realXXX 实际大小，showXXX 显示大小
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

    const { zoom } = this.props;

    if (zoom) {
      let offsetX;
      let offsetY;
      let coordX;
      let coordY;
      let isDragInProgress;

      const startDrag = (event) => {
        const { zoomScale, imageTranslateX, imageTranslateY } = this.state;
        if (zoomScale === 1 || event.button !== 0) {
          return;
        }
        if (!event) {
          event = window.event;
        }

        offsetX = event.clientX;
        offsetY = event.clientY;

        coordX = parseInt(imageTranslateX);
        coordY = parseInt(imageTranslateY);

        isDragInProgress = true;
        this.image.onmousemove = onDrag;
        return false;
      };

      const onDrag = (event) => {
        const { zoomScale } = this.state;
        if (zoomScale === 1 || !isDragInProgress) {
          return;
        }

        this.setState({
          imageTranslateX: coordX + event.clientX - offsetX,
          imageTranslateY: coordY + event.clientY - offsetY,
        });
        return false;
      };

      const stopDrag = () => {
        isDragInProgress = false;
      };

      this.image.onmousedown = startDrag;
      this.image.onmouseup = stopDrag;
    }

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
    const { crop, rotationDegree, zoomScale } = this.state;
    let { width: sWidth, height: sHeight } = crop;

    if (!sWidth || !sHeight) {
      this.onClose();
      return;
    }

    let image = this.image;
    const scale = this.scale;

    let { x: sx, y: sy } = crop;
    let { imageTranslateX, imageTranslateY } = this.state;

    if (scale !== undefined) {
      sx = sx * scale;
      sy = sy * scale;
      sWidth = sWidth * scale;
      sHeight = sHeight * scale;
      imageTranslateX = imageTranslateX * scale;
      imageTranslateY = imageTranslateY * scale;
    }

    const { width: dWidth, height: dHeight } = this.props;

    // 获取裁切后的图片
    const canvas = document.createElement('canvas');
    canvas.width = dWidth;
    canvas.height = dHeight;
    const ctx = canvas.getContext('2d');

    //Redraw the image only if it has been modified
    if (rotationDegree || zoomScale > 1) {
      const canvas1 = document.createElement('canvas');
      canvas1.width = image.naturalWidth;
      canvas1.height = image.naturalHeight;
      const ctx1 = canvas1.getContext('2d');

      const canvas1HalfWidth = canvas1.width / 2;
      const canvas1HalfHeight = canvas1.height / 2;

      ctx1.translate(canvas1HalfWidth, canvas1HalfHeight);
      ctx1.translate(imageTranslateX, imageTranslateY);

      //Apply the zoom
      if (zoomScale > 1) {
        ctx1.scale(zoomScale, zoomScale);
      }

      //Apply the rotation
      if (rotationDegree) {
        ctx1.rotate((rotationDegree * Math.PI) / 180);
      }

      ctx1.translate(-canvas1HalfWidth, -canvas1HalfHeight);

      //Redraw the image
      ctx1.drawImage(image, 0, 0);
      image = canvas1;
    }
    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

    const { name, type, uid } = this.oldFile;
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
    this.oldFile = undefined;
    this.image = undefined;
    this.scale = undefined;
    this.setState({
      modalVisible: false,
      crop: {},
      rotationDegree: 0,
      zoomScale: 1,
      imageTranslateX: 0,
      imageTranslateY: 0,
    });
  };

  onRotationDegreeChange = (value) => {
    this.setState({
      rotationDegree: value,
    });
  };

  onZoomScaleChange = (value) => {
    this.setState({
      zoomScale: value,
    });
    if (value === 1) {
      this.setState({
        imageTranslateX: 0,
        imageTranslateY: 0,
      });
    }
  };

  render() {
    const {
      modalTitle,
      modalWidth,
      resize,
      resizeAndDrag,
      rotation,
      rotationTitle,
      zoom,
      zoomTitle,
    } = this.props;
    const {
      modalVisible,
      src,
      crop,
      rotationDegree,
      zoomScale,
      imageTranslateX,
      imageTranslateY,
    } = this.state;

    const transformStyle = `translate(${imageTranslateX}px, ${imageTranslateY}px) rotate(${rotationDegree}deg) scale(${zoomScale})`;

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
                    imageStyle={{
                      transform: transformStyle,
                      MozTransform: transformStyle,
                      WebkitTransform: transformStyle,
                      OTransform: transformStyle,
                      MsTransform: transformStyle,
                      cursor: zoomScale > 1 ? 'grab' : 'inherit',
                    }}
                  />
                  {zoom && (
                    <>
                      <div className="break" />
                      <Row className="functionality-box">
                        <Col span={6} className="title">
                          <strong>{zoomTitle ? zoomTitle : ZOOM_TITLE}</strong>
                        </Col>
                        <Col span={18}>
                          <Slider
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={this.onZoomScaleChange}
                            value={typeof zoomScale === 'number' ? zoomScale : 1}
                          />
                        </Col>
                      </Row>
                    </>
                  )}
                  {rotation && (
                    <>
                      <div className="break" />
                      <Row className="functionality-box">
                        <Col span={6} className="title">
                          <strong>{rotationTitle ? rotationTitle : ROTATION_TITLE}</strong>
                        </Col>
                        <Col span={18}>
                          <Slider
                            min={0}
                            max={360}
                            onChange={this.onRotationDegreeChange}
                            value={typeof rotationDegree === 'number' ? rotationDegree : 0}
                          />
                        </Col>
                      </Row>
                    </>
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

  children: PropTypes.node,

  rotation: PropTypes.bool,
  rotationTitle: PropTypes.string,
  zoom: PropTypes.bool,
  zoomTitle: PropTypes.string,
};

ImgCrop.defaultProps = {
  width: 100,
  height: 100,
  contain: false,
  resize: true,
  resizeAndDrag: true,

  modalTitle: MODAL_TITLE,
  modalWidth: 520,

  rotation: false,
  zoom: false,
};

export default ImgCrop;
