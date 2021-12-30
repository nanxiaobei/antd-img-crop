import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, memo } from 'react';
import Cropper from 'react-easy-crop';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import AntModal from 'antd/es/modal';
import AntSlider from 'antd/es/slider';
import './index.less';

const cls = 'img-crop';

const INIT_ZOOM = 1;
const ZOOM_STEP = 0.1;
const INIT_ROTATE = 0;
const ROTATE_STEP = 1;
const MIN_ROTATE = -180;
const MAX_ROTATE = 180;

const EasyCrop = forwardRef((props, ref) => {
  const {
    image,
    aspect,
    shape,
    grid,

    zoom,
    rotate,
    minZoom,
    maxZoom,

    rotateValRef,
    setZoomValRef,
    setRotateValRef,
    cropPixelsRef,

    cropperProps,
  } = props;

  const [crop, onCropChange] = useState({ x: 0, y: 0 });
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
        image={image}
        crop={crop}
        cropSize={cropSize}
        onCropChange={onCropChange}
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
        classes={{ containerClassName: `${cls}-container`, mediaClassName: `${cls}-media` }}
      />
      {zoom && (
        <section className={`${cls}-control ${cls}-control-zoom`}>
          <button
            onClick={() => setZoomVal(zoomVal - ZOOM_STEP)}
            disabled={zoomVal - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <AntSlider
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
        </section>
      )}
      {rotate && (
        <section className={`${cls}-control ${cls}-control-rotate`}>
          <button
            onClick={() => setRotateVal(rotateVal - ROTATE_STEP)}
            disabled={rotateVal === MIN_ROTATE}
          >
            ↺
          </button>
          <AntSlider
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
        </section>
      )}
    </>
  );
});

const EasyCropMemo = memo(EasyCrop);

const ImgCrop = forwardRef((props, ref) => {
  const {
    aspect = 1,
    shape = 'rect',
    grid = false,
    quality = 0.4,
    fillColor = 'white',

    zoom = true,
    rotate = false,
    minZoom = 1,
    maxZoom = 3,

    gifCrop,

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

  const cb = useRef({});
  useEffect(() => {
    cb.current.onModalOk = onModalOk;
    cb.current.onModalCancel = onModalCancel;
    cb.current.beforeCrop = beforeCrop;
    cb.current.onUploadFail = onUploadFail;
  }, [beforeCrop, onModalCancel, onModalOk, onUploadFail]);

  /**
   * Upload
   */
  const [image, setImage] = useState('');
  const fileRef = useRef();
  const resolveRef = useRef();
  const rejectRef = useRef();
  const beforeUploadRef = useRef();

  const uploadComponent = useMemo(() => {
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
            if (cb.current.beforeCrop && !(await cb.current.beforeCrop(file, fileList))) {
              reject();
              return;
            }

            fileRef.current = file;
            resolveRef.current = (newFile) => {
              cb.current.onModalOk?.(newFile);
              resolve(newFile);
            };
            rejectRef.current = (uploadErr) => {
              cb.current.onUploadFail?.(uploadErr);
              reject(uploadErr);
            };

            if (gifCrop === false && (file.type === 'image/gif')) { //gifCrop : false ignore .gif crop
              resolve(file);
              return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => setImage(reader.result));
            reader.readAsDataURL(file);
          });
        },
      },
    };
  }, [children]);

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

  const onClose = () => {
    setImage('');
    setZoomValRef.current(INIT_ZOOM);
    setRotateValRef.current(INIT_ROTATE);
  };

  const onCancel = useCallback(() => {
    cb.current.onModalCancel?.();
    onClose();
  }, []);

  const onOk = useCallback(async () => {
    onClose();

    const rawImg = document.querySelector(`.${cls}-media`);
    let { width: cropWidth, height: cropHeight, x: cropX, y: cropY } = cropPixelsRef.current;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (rotate && rotateValRef.current !== INIT_ROTATE) {
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
      ctx.rotate((Math.PI / 180) * rotateValRef.current);
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
    const onBlob = async (blob) => {
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
    };
    canvas.toBlob(onBlob, type, quality);
  }, [fillColor, quality, rotate]);

  const getComponent = (titleOfModal) => (
    <>
      {uploadComponent}
      {image && (
        <AntModal
          visible={true}
          wrapClassName={`${cls}-modal`}
          title={titleOfModal}
          onOk={onOk}
          onCancel={onCancel}
          maskClosable={false}
          destroyOnClose
          {...modalProps}
        >
          <EasyCropMemo
            ref={ref}
            image={image}
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
        </AntModal>
      )}
    </>
  );

  if (modalTitle) return getComponent(modalTitle);

  return (
    <LocaleReceiver>
      {(locale, code) => getComponent(code === 'zh-cn' ? '编辑图片' : 'Edit image')}
    </LocaleReceiver>
  );
});

export default ImgCrop;
