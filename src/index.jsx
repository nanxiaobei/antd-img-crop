import React, { useState, useCallback, useRef, forwardRef } from 'react';
import t from 'prop-types';
import Cropper from 'react-easy-crop';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import Modal from 'antd/es/modal';
import Slider from 'antd/es/slider';
import './index.less';

const pkg = 'antd-img-crop';
const noop = () => {};

const MEDIA_CLASS = `${pkg}-media`;
const MODAL_TITLE = 'Edit image';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const MIN_ROTATE = 0;
const MAX_ROTATE = 360;
const ROTATE_STEP = 1;

const EasyCrop = forwardRef((props, ref) => {
  const {
    src,
    aspect,
    shape,
    grid,
    hasZoom,
    zoomVal,
    rotateVal,
    setZoomVal,
    setRotateVal,
    onComplete,
  } = props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const onCropComplete = useCallback(
    (croppedArea, croppedAreaPixels) => {
      onComplete(croppedAreaPixels);
    },
    [onComplete]
  );

  return (
    <Cropper
      ref={ref}
      image={src}
      aspect={aspect}
      cropShape={shape}
      showGrid={grid}
      zoomWithScroll={hasZoom}
      crop={crop}
      zoom={zoomVal}
      rotation={rotateVal}
      onCropChange={setCrop}
      onZoomChange={setZoomVal}
      onRotationChange={setRotateVal}
      onCropComplete={onCropComplete}
      classes={{ containerClassName: `${pkg}-container`, mediaClassName: MEDIA_CLASS }}
    />
  );
});

EasyCrop.propTypes = {
  src: t.string,
  aspect: t.number,
  shape: t.string,
  grid: t.bool,
  hasZoom: t.bool,
  zoomVal: t.number,
  rotateVal: t.number,
  setZoomVal: t.func,
  setRotateVal: t.func,
  onComplete: t.func,
};

const ImgCrop = forwardRef((props, ref) => {
  const {
    aspect,
    shape,
    grid,
    zoom,
    rotate,
    beforeCrop,
    modalTitle,
    modalWidth,
    modalOk,
    modalCancel,
    children,
  } = props;

  const hasZoom = zoom === true;
  const hasRotate = rotate === true;

  const modalTextProps = { okText: modalOk, cancelText: modalCancel };
  Object.keys(modalTextProps).forEach((key) => {
    if (!modalTextProps[key]) delete modalTextProps[key];
  });

  const [src, setSrc] = useState('');
  const [zoomVal, setZoomVal] = useState(1);
  const [rotateVal, setRotateVal] = useState(0);

  const beforeUploadRef = useRef();
  const fileRef = useRef();
  const resolveRef = useRef(noop);
  const rejectRef = useRef(noop);

  const cropPixelsRef = useRef();

  /**
   * Upload
   */
  const renderUpload = useCallback(() => {
    const upload = Array.isArray(children) ? children[0] : children;
    const { beforeUpload, accept, ...restUploadProps } = upload.props;
    beforeUploadRef.current = beforeUpload;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || 'image/*',
        beforeUpload: (file, fileList) =>
          new Promise((resolve, reject) => {
            if (beforeCrop && !beforeCrop(file, fileList)) {
              reject();
              return;
            }

            fileRef.current = file;
            resolveRef.current = resolve;
            rejectRef.current = reject;

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              setSrc(reader.result);
            });
            reader.readAsDataURL(file);
          }),
      },
    };
  }, [beforeCrop, children]);

  /**
   * EasyCrop
   */
  const onComplete = useCallback((croppedAreaPixels) => {
    cropPixelsRef.current = croppedAreaPixels;
  }, []);

  /**
   * Controls
   */
  const isMinZoom = zoomVal === MIN_ZOOM;
  const isMaxZoom = zoomVal === MAX_ZOOM;
  const isMinRotate = rotateVal === MIN_ROTATE;
  const isMaxRotate = rotateVal === MAX_ROTATE;

  const subZoomVal = useCallback(() => {
    if (!isMinZoom) setZoomVal(zoomVal - ZOOM_STEP);
  }, [isMinZoom, zoomVal]);

  const addZoomVal = useCallback(() => {
    if (!isMaxZoom) setZoomVal(zoomVal + ZOOM_STEP);
  }, [isMaxZoom, zoomVal]);

  const subRotateVal = useCallback(() => {
    if (!isMinRotate) setRotateVal(rotateVal - ROTATE_STEP);
  }, [isMinRotate, rotateVal]);

  const addRotateVal = useCallback(() => {
    if (!isMaxRotate) setRotateVal(rotateVal + ROTATE_STEP);
  }, [isMaxRotate, rotateVal]);

  /**
   * Modal
   */
  const onClose = useCallback(() => {
    setSrc('');
    setZoomVal(1);
    setRotateVal(0);
  }, []);

  const onOk = useCallback(async () => {
    onClose();

    const naturalImg = document.querySelector(`.${MEDIA_CLASS}`);
    const { naturalWidth, naturalHeight } = naturalImg;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // create a max canvas to cover the source image after rotated
    const maxLen = Math.sqrt(Math.pow(naturalWidth, 2) + Math.pow(naturalHeight, 2));
    canvas.width = maxLen;
    canvas.height = maxLen;

    // rotate the image
    if (hasRotate && rotateVal > 0 && rotateVal < 360) {
      const halfMax = maxLen / 2;
      ctx.translate(halfMax, halfMax);
      ctx.rotate((rotateVal * Math.PI) / 180);
      ctx.translate(-halfMax, -halfMax);
    }

    // draw the source image in the center of the max canvas
    const left = (maxLen - naturalWidth) / 2;
    const top = (maxLen - naturalHeight) / 2;
    ctx.drawImage(naturalImg, left, top);

    // shrink the max canvas to the crop area size, then align two center points
    const maxImgData = ctx.getImageData(0, 0, maxLen, maxLen);
    const { width, height, x, y } = cropPixelsRef.current;
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(maxImgData, -left - x, -top - y);

    // get the new image
    const { type, name, uid } = fileRef.current;
    canvas.toBlob(
      async (blob) => {
        let newFile = blob;

        newFile.lastModifiedDate = Date.now();
        newFile.name = name;
        newFile.uid = uid;

        if (typeof beforeUploadRef.current !== 'function') return resolveRef.current(newFile);

        const res = beforeUploadRef.current(newFile, [newFile]);

        if (typeof res !== 'boolean' && !res) {
          console.error('beforeUpload must return a boolean or Promise');
          return;
        }

        if (res === true) return resolveRef.current(newFile);
        if (res === false) return rejectRef.current('not upload');
        if (res && typeof res.then === 'function') {
          try {
            const passedFile = await res;
            const type = Object.prototype.toString.call(passedFile);
            if (type === '[object File]' || type === '[object Blob]') newFile = passedFile;
            resolveRef.current(newFile);
          } catch (err) {
            rejectRef.current(err);
          }
        }
      },
      type,
      0.4
    );
  }, [hasRotate, onClose, rotateVal]);

  return (
    <LocaleReceiver>
      {(locale, localeCode) => (
        <>
          {renderUpload()}
          {src && (
            <Modal
              visible={true}
              wrapClassName={`${pkg}-modal`}
              title={localeCode === 'zh-cn' && modalTitle === MODAL_TITLE ? '编辑图片' : modalTitle}
              width={modalWidth}
              onOk={onOk}
              onCancel={onClose}
              maskClosable={false}
              destroyOnClose
              {...modalTextProps}
            >
              <EasyCrop
                ref={ref}
                src={src}
                aspect={aspect}
                shape={shape}
                grid={grid}
                hasZoom={hasZoom}
                zoomVal={zoomVal}
                rotateVal={rotateVal}
                setZoomVal={setZoomVal}
                setRotateVal={setRotateVal}
                onComplete={onComplete}
              />
              {hasZoom && (
                <div className={`${pkg}-control zoom`}>
                  <button onClick={subZoomVal} disabled={isMinZoom}>
                    －
                  </button>
                  <Slider
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={ZOOM_STEP}
                    value={zoomVal}
                    onChange={setZoomVal}
                  />
                  <button onClick={addZoomVal} disabled={isMaxZoom}>
                    ＋
                  </button>
                </div>
              )}
              {hasRotate && (
                <div className={`${pkg}-control rotate`}>
                  <button onClick={subRotateVal} disabled={isMinRotate}>
                    ↺
                  </button>
                  <Slider
                    min={MIN_ROTATE}
                    max={MAX_ROTATE}
                    step={ROTATE_STEP}
                    value={rotateVal}
                    onChange={setRotateVal}
                  />
                  <button onClick={addRotateVal} disabled={isMaxRotate}>
                    ↻
                  </button>
                </div>
              )}
            </Modal>
          )}
        </>
      )}
    </LocaleReceiver>
  );
});

ImgCrop.propTypes = {
  aspect: t.number,
  shape: t.oneOf(['rect', 'round']),
  zoom: t.bool,
  grid: t.bool,
  rotate: t.bool,
  beforeCrop: t.func,
  modalTitle: t.string,
  modalWidth: t.oneOfType([t.number, t.string]),
  modalOk: t.string,
  modalCancel: t.string,
  children: t.node,
};

ImgCrop.defaultProps = {
  aspect: 1,
  shape: 'rect',
  grid: false,
  zoom: true,
  rotate: false,
  modalTitle: MODAL_TITLE,
  modalWidth: 520,
};

export default ImgCrop;
