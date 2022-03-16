import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, memo } from 'react';
import Cropper from 'react-easy-crop';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import AntModal from 'antd/es/modal';
import AntSlider from 'antd/es/slider';
import './index.less';
import type { ReactNode } from 'react';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import type { BeforeUploadValueType, EasyCropProps, ImgCropProps } from '../index.d';
import { Area } from 'react-easy-crop/types';

const cls = 'img-crop';

const INIT_ZOOM = 1;
const ZOOM_STEP = 0.1;
const INIT_ROTATE = 0;
const ROTATE_STEP = 1;
const MIN_ROTATE = -180;
const MAX_ROTATE = 180;

const EasyCrop = forwardRef<Cropper, EasyCropProps>((props, ref) => {
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

const ImgCrop = forwardRef<Cropper, ImgCropProps & { children?: ReactNode }>((props, ref) => {
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

  const cb = useRef<
    Pick<ImgCropProps, 'onModalOk' | 'onModalCancel' | 'beforeCrop' | 'onUploadFail'>
  >({});
  cb.current.onModalOk = onModalOk;
  cb.current.onModalCancel = onModalCancel;
  cb.current.beforeCrop = beforeCrop;
  cb.current.onUploadFail = onUploadFail;

  /**
   * Upload
   */
  const [image, setImage] = useState('');
  const fileRef = useRef<RcFile>();
  const resolveRef = useRef<(file: BeforeUploadValueType) => void>();
  const rejectRef = useRef<(err: Error) => void>();
  const beforeUploadRef = useRef<UploadProps['beforeUpload']>();

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

            const reader = new FileReader();
            reader.addEventListener(
              'load',
              () => typeof reader.result === 'string' && setImage(reader.result)
            );
            reader.readAsDataURL(file);
          });
        },
      },
    };
  }, [children]);

  /**
   * Crop
   */
  const rotateValRef = useRef<number>();
  const setZoomValRef = useRef<React.Dispatch<React.SetStateAction<number>>>();
  const setRotateValRef = useRef<React.Dispatch<React.SetStateAction<number>>>();
  const cropPixelsRef = useRef<Area>();

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

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imgSource = document.querySelector(`.${cls}-media`) as CanvasImageSource & {
      naturalWidth: number;
      naturalHeight: number;
    };
    const { width: cropWidth, height: cropHeight, x: cropX, y: cropY } = cropPixelsRef.current;

    if (rotate && rotateValRef.current !== INIT_ROTATE) {
      const { naturalWidth: imgWidth, naturalHeight: imgHeight } = imgSource;
      const angle = rotateValRef.current * (Math.PI / 180);

      // get container for rotated image
      const sine = Math.abs(Math.sin(angle));
      const cosine = Math.abs(Math.cos(angle));
      const squareWidth = imgWidth * cosine + imgHeight * sine;
      const squareHeight = imgHeight * cosine + imgWidth * sine;

      canvas.width = squareWidth;
      canvas.height = squareHeight;
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, squareWidth, squareHeight);

      // rotate container
      const squareHalfWidth = squareWidth / 2;
      const squareHalfHeight = squareHeight / 2;
      ctx.translate(squareHalfWidth, squareHalfHeight);
      ctx.rotate(angle);
      ctx.translate(-squareHalfWidth, -squareHalfHeight);

      // draw rotated image
      const imgX = (squareWidth - imgWidth) / 2;
      const imgY = (squareHeight - imgHeight) / 2;
      ctx.drawImage(imgSource, 0, 0, imgWidth, imgHeight, imgX, imgY, imgWidth, imgHeight);

      // crop rotated image
      const imgData = ctx.getImageData(0, 0, squareWidth, squareHeight);
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.putImageData(imgData, -cropX, -cropY);
    } else {
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, cropWidth, cropHeight);

      ctx.drawImage(imgSource, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    }

    // get the new image
    const { type, name, uid } = fileRef.current;
    const onBlob = async (blob: Blob | null) => {
      let newFile = Object.assign(new File([blob], name, { type }), { uid }) as RcFile;

      if (typeof beforeUploadRef.current !== 'function') {
        return resolveRef.current(newFile);
      }

      const res = beforeUploadRef.current(newFile, [newFile]);

      if (typeof res !== 'boolean' && !res) {
        console.error('beforeUpload must return a boolean or Promise');
        return;
      }

      if (res === true) return resolveRef.current(newFile);
      if (res === false) return rejectRef.current(new Error('not upload'));
      if (res && res instanceof Promise) {
        try {
          const passedFile = await res;
          if (passedFile instanceof File || passedFile instanceof Blob) {
            return resolveRef.current(passedFile);
          }
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
