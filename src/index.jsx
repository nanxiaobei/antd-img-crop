import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, memo } from 'react';
import t from 'prop-types';
import Cropper from 'react-easy-crop';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import Modal from 'antd/es/modal';
import Slider from 'antd/es/slider';
import './index.less';

const pkg = 'antd-img-crop';

const INIT_ZOOM = 1;
const ZOOM_STEP = 0.1;

const INIT_ROTATE = 0;
const ROTATE_STEP = 1;
const MIN_ROTATE = -180;
const MAX_ROTATE = 180;

const EasyCrop = memo(
  forwardRef((props, ref) => {
    const {
      src,
      aspect,
      shape,
      grid,

      zoom,
      rotate,
      rotateValRef,
      setZoomValRef,
      setRotateValRef,

      minZoom,
      maxZoom,
      cropPixelsRef,

      cropperProps,
    } = props;

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [cropSize, setCropSize] = useState({ width: 0, height: 0 });

    const onCropComplete = useCallback(
      (croppedArea, croppedAreaPixels) => {
        cropPixelsRef.current = croppedAreaPixels;
      },
      [cropPixelsRef]
    );

    const onMediaLoaded = useCallback(
      (mediaSize) => {
        const { width, height } = mediaSize;
        const ratioWidth = height * aspect;

        if (width > ratioWidth) {
          setCropSize({ width: ratioWidth, height });
        } else {
          setCropSize({ width, height: width / aspect });
        }
      },
      [aspect]
    );

    const [zoomVal, setZoomVal] = useState(INIT_ZOOM);
    const [rotateVal, setRotateVal] = useState(INIT_ROTATE);
    rotateValRef.current = rotateVal;

    useEffect(() => {
      setZoomValRef.current = setZoomVal;
      setRotateValRef.current = setRotateVal;
    }, [setRotateValRef, setZoomValRef]);

    return (
      <>
        <Cropper
          {...cropperProps}
          ref={ref}
          image={src}
          crop={crop}
          cropSize={cropSize}
          onCropChange={setCrop}
          aspect={aspect}
          cropShape={shape}
          showGrid={grid}
          zoomWithScroll={zoom}
          zoom={zoomVal}
          rotation={rotateVal}
          onZoomChange={setZoomVal}
          onRotationChange={setRotateVal}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onCropComplete={onCropComplete}
          onMediaLoaded={onMediaLoaded}
          classes={{ containerClassName: `${pkg}-container`, mediaClassName: `${pkg}-media` }}
        />
        {zoom && (
          <div className={`${pkg}-control zoom`}>
            <button
              onClick={() => setZoomVal(zoomVal - ZOOM_STEP)}
              disabled={zoomVal - ZOOM_STEP < minZoom}
            >
              －
            </button>
            <Slider
              min={minZoom}
              max={maxZoom}
              step={ZOOM_STEP}
              value={zoomVal}
              onChange={setZoomVal}
            />
            <button
              onClick={() => setZoomVal(zoomVal + ZOOM_STEP)}
              disabled={zoomVal + ZOOM_STEP > maxZoom}
            >
              ＋
            </button>
          </div>
        )}
        {rotate && (
          <div className={`${pkg}-control rotate`}>
            <button
              onClick={() => setRotateVal(rotateVal - ROTATE_STEP)}
              disabled={rotateVal === MIN_ROTATE}
            >
              ↺
            </button>
            <Slider
              min={MIN_ROTATE}
              max={MAX_ROTATE}
              step={ROTATE_STEP}
              value={rotateVal}
              onChange={setRotateVal}
            />
            <button
              onClick={() => setRotateVal(rotateVal + ROTATE_STEP)}
              disabled={rotateVal === MAX_ROTATE}
            >
              ↻
            </button>
          </div>
        )}
      </>
    );
  })
);

EasyCrop.propTypes = {
  src: t.string,
  aspect: t.number,
  shape: t.string,
  grid: t.bool,

  zoom: t.bool,
  rotate: t.bool,
  rotateValRef: t.object,
  setZoomValRef: t.object,
  setRotateValRef: t.object,

  minZoom: t.number,
  maxZoom: t.number,
  cropPixelsRef: t.object,

  cropperProps: t.object,
};

const ImgCrop = forwardRef((props, ref) => {
  const {
    aspect,
    shape,
    grid,
    quality,

    zoom,
    rotate,
    minZoom,
    maxZoom,
    fillColor,

    modalTitle,
    modalWidth,
    modalOk,
    modalCancel,
    onModalOk,
    onModalCancel,

    beforeCrop,
    onUploadFail,
    cropperProps,
    children,
  } = props;

  /**
   * Upload
   */
  const [src, setSrc] = useState('');
  const fileRef = useRef();
  const resolveRef = useRef();
  const rejectRef = useRef();
  const beforeUploadRef = useRef();

  const renderUpload = useCallback(() => {
    const upload = Array.isArray(children) ? children[0] : children;
    const { beforeUpload, accept, ...restUploadProps } = upload.props;
    beforeUploadRef.current = beforeUpload;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || 'image/*',
        beforeUpload: (file, fileList) => {
          return new Promise(async (resolve, reject) => {
            if (beforeCrop && !(await beforeCrop(file, fileList))) {
              reject();
              return;
            }

            fileRef.current = file;
            resolveRef.current = (newFile) => {
              onModalOk?.(newFile);
              resolve(newFile);
            };
            rejectRef.current = (uploadErr) => {
              onUploadFail?.(uploadErr);
              reject(uploadErr);
            };

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              setSrc(reader.result);
            });
            reader.readAsDataURL(file);
          });
        },
      },
    };
  }, [beforeCrop, children, onModalOk, onUploadFail]);

  /**
   * Crop
   */
  const rotateValRef = useRef();
  const setZoomValRef = useRef();
  const setRotateValRef = useRef();
  const cropPixelsRef = useRef();

  /**
   * Modal
   */
  const modalProps = useMemo(() => {
    const obj = { width: modalWidth, okText: modalOk, cancelText: modalCancel };
    Object.keys(obj).forEach((key) => {
      if (!obj[key]) delete obj[key];
    });
    return obj;
  }, [modalCancel, modalOk, modalWidth]);

  const onClose = useCallback(() => {
    setSrc('');
    setZoomValRef.current(INIT_ZOOM);
    setRotateValRef.current(INIT_ROTATE);
  }, []);

  const onCancel = useCallback(() => {
    onModalCancel?.();
    onClose();
  }, [onClose, onModalCancel]);

  const onOk = useCallback(async () => {
    onClose();

    const rawImg = document.querySelector(`.${pkg}-media`);
    let { width: cropWidth, height: cropHeight, x: cropX, y: cropY } = cropPixelsRef.current;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (rotate && rotateValRef.current !== 0) {
      // make canvas to cover the rotated image
      const { naturalWidth: rawWidth, naturalHeight: rawHeight } = rawImg;

      let boxSize = Math.sqrt(Math.pow(rawWidth, 2) + Math.pow(rawHeight, 2));
      let imgWidth = rawWidth;
      let imgHeight = rawHeight;

      // fit the long image
      if (boxSize > 4096) {
        const ratio = 4096 / boxSize;

        boxSize = 4096;
        imgWidth = rawWidth * ratio;
        imgHeight = rawHeight * ratio;

        cropWidth = cropWidth * ratio;
        cropHeight = cropHeight * ratio;
        cropX = cropX * ratio;
        cropY = cropY * ratio;
      }

      canvas.width = boxSize;
      canvas.height = boxSize;

      // rotate image
      const half = boxSize / 2;
      ctx.translate(half, half);
      ctx.rotate((rotateValRef.current * Math.PI) / 180);
      ctx.translate(-half, -half);

      // draw rotated image to canvas center
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, boxSize, boxSize);

      const imgX = (boxSize - imgWidth) / 2;
      const imgY = (boxSize - imgHeight) / 2;

      ctx.drawImage(rawImg, 0, 0, rawWidth, rawHeight, imgX, imgY, imgWidth, imgHeight);
      const rotatedImg = ctx.getImageData(0, 0, boxSize, boxSize);

      // resize canvas to crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, cropWidth, cropHeight);
      ctx.putImageData(rotatedImg, -(imgX + cropX), -(imgY + cropY));
    } else {
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, cropWidth, cropHeight);
      ctx.drawImage(rawImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    }

    // get the new image
    const { type, name, uid } = fileRef.current;
    canvas.toBlob(
      async (blob) => {
        let newFile = new File([blob], name, { type });
        newFile.uid = uid;

        if (typeof beforeUploadRef.current !== 'function') {
          return resolveRef.current(newFile);
        }

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
      quality
    );
  }, [fillColor, onClose, quality, rotate]);

  const renderComponent = (titleOfModal) => (
    <>
      {renderUpload()}
      {src && (
        <Modal
          visible={true}
          wrapClassName={`${pkg}-modal`}
          title={titleOfModal}
          onOk={onOk}
          onCancel={onCancel}
          maskClosable={false}
          destroyOnClose
          {...modalProps}
        >
          <EasyCrop
            ref={ref}
            src={src}
            aspect={aspect}
            shape={shape}
            grid={grid}
            zoom={zoom}
            rotate={rotate}
            rotateValRef={rotateValRef}
            setZoomValRef={setZoomValRef}
            setRotateValRef={setRotateValRef}
            minZoom={minZoom}
            maxZoom={maxZoom}
            cropPixelsRef={cropPixelsRef}
            cropperProps={cropperProps}
          />
        </Modal>
      )}
    </>
  );

  if (modalTitle) return renderComponent(modalTitle);

  return (
    <LocaleReceiver>
      {(locale, localeCode) => renderComponent(localeCode === 'zh-cn' ? '编辑图片' : 'Edit image')}
    </LocaleReceiver>
  );
});

ImgCrop.propTypes = {
  aspect: t.number,
  shape: t.oneOf(['rect', 'round']),
  grid: t.bool,
  quality: t.number,
  fillColor: t.string,

  zoom: t.bool,
  rotate: t.bool,
  minZoom: t.number,
  maxZoom: t.number,

  modalTitle: t.string,
  modalWidth: t.oneOfType([t.number, t.string]),
  modalOk: t.string,
  modalCancel: t.string,
  onModalOk: t.func,
  onModalCancel: t.func,

  beforeCrop: t.func,
  onUploadFail: t.func,
  cropperProps: t.object,
  children: t.node,
};

ImgCrop.defaultProps = {
  aspect: 1,
  shape: 'rect',
  grid: false,
  quality: 0.4,
  fillColor: 'white',

  zoom: true,
  rotate: false,
  minZoom: 1,
  maxZoom: 3,
};

export default ImgCrop;
