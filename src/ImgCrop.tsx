import type { ModalProps } from 'antd';
import { version } from 'antd';
import AntModal from 'antd/es/modal';
import AntUpload from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { compareVersions } from 'compare-versions';
import type { MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type CropperRef from 'react-easy-crop';
import EasyCrop from './EasyCrop';
import './ImgCrop.css';
import { PREFIX, ROTATION_INITIAL } from './constants';
import type {
  BeforeUpload,
  BeforeUploadReturnType,
  EasyCropRef,
  ImgCropProps,
} from './types';

export type { ImgCropProps } from './types';

const openProp = compareVersions(version, '4.23.0') === -1 ? 'visible' : 'open';

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
    showReset = false,
    resetText,

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
    onModalOk,
    onModalCancel,
    modalProps,

    beforeCrop,
    children,
  } = props;

  /**
   * init
   */
  const zoomSlider = deprecate(props, 'zoom', 'zoomSlider') || true;
  const rotationSlider = deprecate(props, 'rotate', 'rotationSlider') || false;
  const cropShape = deprecate(props, 'shape', 'cropShape') || 'rect';
  const showGrid = deprecate(props, 'grid', 'showGrid') || false;

  if ('onUploadFail' in props) {
    console.error(
      `\`onUploadFail\` is removed, because the only way it is called, is when the file is rejected by beforeUpload`,
    );
  }

  deprecate(props, 'modalMaskTransitionName', 'modalProps.maskTransitionName');
  deprecate(props, 'modalTransitionName', 'modalProps.transitionName');

  const cb = useRef<
    Pick<ImgCropProps, 'onModalOk' | 'onModalCancel' | 'beforeCrop'>
  >({});
  cb.current.onModalOk = onModalOk;
  cb.current.onModalCancel = onModalCancel;
  cb.current.beforeCrop = beforeCrop;

  /**
   * crop
   */
  const easyCropRef = useRef<EasyCropRef>(null);
  const getCropCanvas = useCallback(
    (target: ShadowRoot) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const context = (target?.getRootNode?.() as ShadowRoot) || document;

      type ImgSource = CanvasImageSource & {
        naturalWidth: number;
        naturalHeight: number;
      };

      const imgSource = context.querySelector(`.${PREFIX}-media`) as ImgSource;

      const {
        width: cropWidth,
        height: cropHeight,
        x: cropX,
        y: cropY,
      } = easyCropRef.current!.cropPixelsRef.current;

      if (
        rotationSlider &&
        easyCropRef.current!.rotation !== ROTATION_INITIAL
      ) {
        const { naturalWidth: imgWidth, naturalHeight: imgHeight } = imgSource;
        const angle = easyCropRef.current!.rotation * (Math.PI / 180);

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
          imgHeight,
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
          cropHeight,
        );
      }

      return canvas;
    },
    [fillColor, rotationSlider],
  );

  /**
   * upload
   */
  const [modalImage, setModalImage] = useState('');
  const onCancel = useRef<ModalProps['onCancel']>();
  const onOk = useRef<ModalProps['onOk']>();

  const runBeforeUpload = useCallback(
    async ({
      beforeUpload,
      file,
      resolve,
      reject,
    }: {
      beforeUpload: BeforeUpload;
      file: RcFile;
      resolve: (parsedFile: BeforeUploadReturnType) => void;
      reject: (rejectErr: BeforeUploadReturnType) => void;
    }) => {
      const rawFile = file as unknown as File;

      if (typeof beforeUpload !== 'function') {
        resolve(rawFile);
        return;
      }

      try {
        // https://ant.design/components/upload-cn#api
        // https://github.com/ant-design/ant-design/blob/master/components/upload/Upload.tsx#L152-L178
        const result = await beforeUpload(file, [file]);

        if (result === false) {
          reject(file);
          return;
        }

        resolve((result !== true && result) || rawFile);
      } catch (err) {
        reject(err as BeforeUploadReturnType);
      }
    },
    [],
  );

  const getNewBeforeUpload = useCallback(
    (beforeUpload: BeforeUpload) => {
      return ((file, fileList) => {
        return new Promise(async (resolve, reject) => {
          let processedFile = file;

          if (typeof cb.current.beforeCrop === 'function') {
            try {
              const result = await cb.current.beforeCrop(file, fileList);
              if (result === false) {
                return runBeforeUpload({ beforeUpload, file, resolve, reject });
              }
              if (result !== true) {
                processedFile = (result as unknown as RcFile) || file;
              }
            } catch (err) {
              return runBeforeUpload({ beforeUpload, file, resolve, reject });
            }
          }

          // read file
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            if (typeof reader.result === 'string') {
              setModalImage(reader.result); // open modal
            }
          });
          reader.readAsDataURL(processedFile as unknown as Blob);

          // on modal cancel
          onCancel.current = () => {
            setModalImage('');
            easyCropRef.current!.onReset();

            resolve(AntUpload.LIST_IGNORE);
            cb.current.onModalCancel?.(resolve);
          };

          // on modal confirm
          onOk.current = async (event: MouseEvent<HTMLElement>) => {
            setModalImage('');
            easyCropRef.current!.onReset();

            const canvas = getCropCanvas(event.target as ShadowRoot);
            const { type, name, uid } = processedFile as UploadFile;

            canvas.toBlob(
              async (blob) => {
                const newFile = new File([blob as BlobPart], name, { type });
                Object.assign(newFile, { uid });

                runBeforeUpload({
                  beforeUpload,
                  file: newFile as unknown as RcFile,
                  resolve: (file) => {
                    resolve(file);
                    cb.current.onModalOk?.(file);
                  },
                  reject: (err) => {
                    reject(err);
                    cb.current.onModalOk?.(err);
                  },
                });
              },
              type,
              quality,
            );
          };
        });
      }) as BeforeUpload;
    },
    [getCropCanvas, quality, runBeforeUpload],
  );

  const getNewUpload = useCallback(
    (children: ReactNode) => {
      const upload = Array.isArray(children) ? children[0] : children;
      const { beforeUpload, accept, ...restUploadProps } = upload.props;

      return {
        ...upload,
        props: {
          ...restUploadProps,
          accept: accept || 'image/*',
          beforeUpload: getNewBeforeUpload(beforeUpload),
        },
      };
    },
    [getNewBeforeUpload],
  );

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

  const wrapClassName = `${PREFIX}-modal${
    modalClassName ? ` ${modalClassName}` : ''
  }`;

  const lang = typeof window === 'undefined' ? '' : window.navigator.language;
  const isCN = lang === 'zh-CN';
  const title = modalTitle || (isCN ? '编辑图片' : 'Edit image');
  const resetBtnText = resetText || (isCN ? '重置' : 'Reset');

  return (
    <>
      {getNewUpload(children)}
      {modalImage && (
        <AntModal
          {...modalProps}
          {...modalBaseProps}
          {...{ [openProp]: true }}
          title={title}
          onCancel={onCancel.current}
          onOk={onOk.current}
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
            resetBtnText={resetBtnText}
            modalImage={modalImage}
            aspect={aspect}
            minZoom={minZoom}
            maxZoom={maxZoom}
            cropShape={cropShape}
            showGrid={showGrid}
            cropperProps={cropperProps}
          />
        </AntModal>
      )}
    </>
  );
});

export default ImgCrop;
