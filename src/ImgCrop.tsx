import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type CropperRef from 'react-easy-crop';
import { version } from 'antd';
import type { ModalProps } from 'antd';
import type { UploadProps } from 'antd';
import AntModal from 'antd/es/modal';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { compareVersions } from 'compare-versions';
import { PREFIX, ROTATION_INITIAL, ZOOM_INITIAL } from './constants';
import type { EasyCropRef, ImgCropProps, OnModalOk } from './types';
import EasyCrop from './EasyCrop';
import './ImgCrop.css';

export type { ImgCropProps } from './types';

const openKey = compareVersions(version, '4.23.0') === -1 ? 'visible' : 'open';

const deprecate = (obj: Record<string, any>, old: string, now: string) => {
  if (old in obj) {
    console.error(`\`${old}\` is deprecated, please use \`${now}\` instead`);
    return obj[old];
  }
  return obj[now];
};

const ImgCrop = forwardRef<CropperRef, ImgCropProps>((props, cropperRef) => {
  const {
    quality = 0.4,
    fillColor = 'white',

    // @ts-ignore
    zoomSlider: ZOOM_SLIDER = true,
    // @ts-ignore
    rotationSlider: ROTATION_SLIDER = false,
    aspectSlider = false,

    aspect = 1,
    minZoom = 1,
    maxZoom = 3,
    // @ts-ignore
    cropShape: CROP_SHAPE = 'rect',
    // @ts-ignore
    showGrid: SHOW_GRID = false,
    cropperProps,

    modalClassName,
    modalTitle,
    modalWidth,
    modalOk,
    modalCancel,
    showReset = false,
    onModalOk,
    onModalCancel,
    modalProps,

    beforeCrop,
    onUploadFail,
    children,
  } = props;

  const zoomSlider = deprecate(props, 'zoom', 'zoomSlider') || true;
  const rotationSlider = deprecate(props, 'rotate', 'rotationSlider') || false;
  const cropShape = deprecate(props, 'shape', 'cropShape') || 'rect';
  const showGrid = deprecate(props, 'grid', 'showGrid') || false;

  deprecate(props, 'modalMaskTransitionName', 'modalProps.maskTransitionName');
  deprecate(props, 'modalTransitionName', 'modalProps.transitionName');

  const cb = useRef<
    Pick<
      ImgCropProps,
      'onModalOk' | 'onModalCancel' | 'beforeCrop' | 'onUploadFail'
    >
  >({});
  cb.current.onModalOk = onModalOk;
  cb.current.onModalCancel = onModalCancel;
  cb.current.beforeCrop = beforeCrop;
  cb.current.onUploadFail = onUploadFail;

  /**
   * upload
   */
  const [image, setImage] = useState('');
  const fileRef = useRef<UploadFile>({} as UploadFile);
  const beforeUploadRef = useRef<UploadProps['beforeUpload']>();
  const resolveRef = useRef<OnModalOk>(() => {});
  const rejectRef = useRef<(err: Error) => void>(() => {});

  const uploadComponent = useMemo(() => {
    const upload = Array.isArray(children) ? children[0] : children;
    const { beforeUpload, accept, ...restUploadProps } = upload.props;
    beforeUploadRef.current = beforeUpload;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || 'image/*',
        beforeUpload: (file: RcFile, fileList: RcFile[]) => {
          return new Promise(async (resolve, reject) => {
            if (typeof cb.current.beforeCrop === 'function') {
              const shouldCrop = await cb.current.beforeCrop(file, fileList);
              if (!shouldCrop) {
                return reject();
              }
            }

            fileRef.current = file as UploadFile;
            resolveRef.current = (newFile) => {
              cb.current.onModalOk?.(newFile);
              resolve(newFile);
            };
            rejectRef.current = (uploadErr) => {
              cb.current.onUploadFail?.(uploadErr);
              reject();
            };

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              if (typeof reader.result === 'string') {
                setImage(reader.result);
              }
            });
            reader.readAsDataURL(file as unknown as Blob);
          });
        },
      },
    };
  }, [children]);

  /**
   * crop
   */
  const easyCropRef = useRef<EasyCropRef>({} as EasyCropRef);

  /**
   * modal
   */
  const modalBaseProps = useMemo(() => {
    const obj: Pick<ModalProps, 'width' | 'okText' | 'cancelText'> = {};
    if (modalWidth !== undefined) obj.width = modalWidth;
    if (modalOk !== undefined) obj.okText = modalOk;
    if (modalCancel !== undefined) obj.cancelText = modalCancel;
    return obj;
  }, [modalCancel, modalOk, modalWidth]);

  const onClose = () => {
    setImage('');
    easyCropRef.current.setZoom(ZOOM_INITIAL);
    easyCropRef.current.setRotation(ROTATION_INITIAL);
  };

  const onCancel = useCallback(() => {
    cb.current.onModalCancel?.();
    onClose();
  }, []);

  const onOk = useCallback(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      onClose();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const target = event.target;
      const context =
        ((target as ShadowRoot)?.getRootNode?.() as ShadowRoot) || document;

      const imgSource = context.querySelector(
        `.${PREFIX}-media`
      ) as CanvasImageSource & {
        naturalWidth: number;
        naturalHeight: number;
      };

      const {
        width: cropWidth,
        height: cropHeight,
        x: cropX,
        y: cropY,
      } = easyCropRef.current.cropPixelsRef.current;

      if (rotationSlider && easyCropRef.current.rotation !== ROTATION_INITIAL) {
        const { naturalWidth: imgWidth, naturalHeight: imgHeight } = imgSource;
        const angle = easyCropRef.current.rotation * (Math.PI / 180);

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
        ctx.drawImage(
          imgSource,
          0,
          0,
          imgWidth,
          imgHeight,
          imgX,
          imgY,
          imgWidth,
          imgHeight
        );

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

        ctx.drawImage(
          imgSource,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );
      }

      // get the new image
      const { type, name, uid } = fileRef.current;
      canvas.toBlob(
        async (blob) => {
          const newFile = new File([blob as BlobPart], name, { type });
          Object.assign(newFile, { uid });

          if (typeof beforeUploadRef.current !== 'function') {
            resolveRef.current(newFile);
            return;
          }

          // https://github.com/ant-design/ant-design/blob/master/components/upload/Upload.tsx
          // https://ant.design/components/upload-cn#api
          try {
            const rcFile = newFile as unknown as RcFile;
            const result = await beforeUploadRef.current(rcFile, [rcFile]);

            if (result === true) {
              resolveRef.current(newFile); // true
            } else if (result === false) {
              rejectRef.current(new Error('beforeUpload → false')); // false
            } else {
              resolveRef.current(result); // File, Upload.LIST_IGNORE
            }
          } catch (err) {
            rejectRef.current(new Error('beforeUpload → reject')); // reject
          }
        },
        type,
        quality
      );
    },
    [fillColor, quality, rotationSlider]
  );

  const wrapClassName = `${PREFIX}-modal${
    modalClassName ? ` ${modalClassName}` : ''
  }`;

  const lang = typeof window === 'undefined' ? '' : window.navigator.language;
  const isCN = lang === 'zh-CN';
  const title = modalTitle || (isCN ? '编辑图片' : 'Edit image');

  return (
    <>
      {uploadComponent}
      {image && (
        <AntModal
          {...modalProps}
          {...modalBaseProps}
          {...{ [openKey]: true }}
          title={title}
          onOk={onOk}
          onCancel={onCancel}
          wrapClassName={wrapClassName}
          maskClosable={false}
          destroyOnClose
        >
          <EasyCrop
            ref={easyCropRef}
            cropperRef={cropperRef}
            zoomSlider={zoomSlider}
            rotationSlider={rotationSlider}
            aspectSlider={aspectSlider}
            showReset={showReset}
            image={image}
            aspect={aspect}
            minZoom={minZoom}
            maxZoom={maxZoom}
            cropShape={cropShape}
            showGrid={showGrid}
            cropperProps={cropperProps}
            isCN={isCN}
          />
        </AntModal>
      )}
    </>
  );
});

export default ImgCrop;
