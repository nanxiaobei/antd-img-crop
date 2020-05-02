import React, { useState, useCallback, useRef } from 'react';
import t from 'prop-types';
import Cropper from 'react-easy-crop';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import Modal from 'antd/es/modal';
import Slider from 'antd/es/slider';
import './index.less';

const pkg = 'antd-img-crop';
const deprecateMap = {
  width: 'aspect',
  height: 'aspect',
  contain: '',
  resize: 'zoom',
  resizeAndDrag: '',
};
const deprecate = (props) => {
  Object.entries(deprecateMap).forEach(([key, val]) => {
    if (props[key] === undefined) return;
    let msg = `\`${key}\` is deprecated`;
    if (val) msg += `, please use \`${val}\` instead`;
    msg += `, see https://github.com/nanxiaobei/${pkg}`;
    console.error(msg);
  });
};

const MEDIA_CLASS = `${pkg}-media`;
const MODAL_TITLE = 'Edit image';

const EasyCrop = (props) => {
  const {
    src,
    aspect,
    shape,
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
    [onComplete],
  );

  return (
    <Cropper
      image={src}
      aspect={aspect}
      cropShape={shape}
      zoomWithScroll={hasZoom}
      crop={crop}
      zoom={zoomVal}
      rotation={rotateVal}
      onCropChange={setCrop}
      onZoomChange={setZoomVal}
      onRotationChange={setRotateVal}
      onCropComplete={onCropComplete}
      classes={{ containerClassName: `${pkg}-container`, mediaClassName: MEDIA_CLASS }}
      showGrid={false}
    />
  );
};

EasyCrop.propTypes = {
  src: t.string,
  aspect: t.number,
  shape: t.string,
  hasZoom: t.bool,
  zoomVal: t.number,
  rotateVal: t.number,
  setZoomVal: t.func,
  setRotateVal: t.func,
  onComplete: t.func,
};

const ImgCrop = (props) => {
  if (process.env.NODE_ENV !== 'production') deprecate(props);

  const { aspect, shape, zoom, rotate, beforeCrop, modalTitle, modalWidth, children } = props;
  const hasZoom = zoom === true;
  const hasRotate = rotate === true;

  const [src, setSrc] = useState('');
  const [zoomVal, setZoomVal] = useState(1);
  const [rotateVal, setRotateVal] = useState(0);

  const dataRef = useRef({});
  const data = dataRef.current;

  /**
   * Upload
   */
  const renderUpload = useCallback(() => {
    const upload = Array.isArray(children) ? children[0] : children;
    if (!data.uploadProps) {
      const { accept, beforeUpload } = upload.props;
      data.beforeUpload = beforeUpload;
      data.uploadProps = {
        accept: accept || 'image/*',
        beforeUpload: (file, fileList) =>
          new Promise((resolve, reject) => {
            if (beforeCrop && !beforeCrop(file, fileList)) {
              reject();
              return;
            }

            data.file = file;
            data.resolve = resolve;
            data.reject = reject;

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              setSrc(reader.result);
            });
            reader.readAsDataURL(file);
          }),
      };
    }
    return { ...upload, props: { ...upload.props, ...data.uploadProps } };
  }, [data, children, beforeCrop]);

  /**
   * EasyCrop
   */
  const onComplete = useCallback(
    (croppedAreaPixels) => {
      data.croppedAreaPixels = croppedAreaPixels;
    },
    [data],
  );

  /**
   * Modal
   */
  const onClose = useCallback(() => {
    setSrc('');
    setZoomVal(1);
    setRotateVal(0);
    dataRef.current = {};
  }, []);

  const onOk = useCallback(async () => {
    onClose();

    const img = document.querySelector(`.${MEDIA_CLASS}`);
    const { naturalWidth, naturalHeight } = img;
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
    ctx.drawImage(img, left, top);

    // shrink the max canvas to the crop area size, then align two center points
    const maxImgData = ctx.getImageData(0, 0, maxLen, maxLen);
    const { width, height, x, y } = data.croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(maxImgData, -left - x, -top - y);

    // get the new image
    const { beforeUpload = () => true, file, resolve, reject } = data;
    canvas.toBlob(async (blob) => {
      blob.lastModifiedDate = Date.now();
      blob.name = file.name;
      blob.uid = file.uid;

      const res = beforeUpload(blob, [blob]);
      if (res === false) return reject();
      if (res === true) return resolve(blob);
      if (typeof res.then === 'function') {
        try {
          const newFile = await res;
          const fileType = Object.prototype.toString.call(newFile);
          resolve(fileType === '[object File]' || fileType === '[object Blob]' ? newFile : blob);
        } catch (err) {
          reject(err);
        }
      }
    });
  }, [data, onClose, hasRotate, rotateVal]);

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
            >
              <EasyCrop
                src={src}
                aspect={aspect}
                shape={shape}
                hasZoom={hasZoom}
                zoomVal={zoomVal}
                rotateVal={rotateVal}
                setZoomVal={setZoomVal}
                setRotateVal={setRotateVal}
                onComplete={onComplete}
              />
              {hasZoom && (
                <div className={`${pkg}-action zoom`}>
                  <i>－</i>
                  <Slider min={1} max={3} step={0.1} value={zoomVal} onChange={setZoomVal} />
                  <i>＋</i>
                </div>
              )}
              {hasRotate && (
                <div className={`${pkg}-action rotate`}>
                  <i>↻</i>
                  <Slider min={0} max={360} value={rotateVal} onChange={setRotateVal} />
                  <i>↻</i>
                </div>
              )}
            </Modal>
          )}
        </>
      )}
    </LocaleReceiver>
  );
};

ImgCrop.propTypes = {
  aspect: t.number,
  shape: t.oneOf(['rect', 'round']),
  zoom: t.bool,
  rotate: t.bool,
  beforeCrop: t.func,
  modalTitle: t.string,
  modalWidth: t.oneOfType([t.number, t.string]),
  children: t.node,
};

ImgCrop.defaultProps = {
  aspect: 1,
  shape: 'rect',
  zoom: true,
  rotate: false,
  modalTitle: MODAL_TITLE,
  modalWidth: 520,
};

export default ImgCrop;
