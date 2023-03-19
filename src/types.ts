import type {
  Dispatch,
  ForwardedRef,
  MutableRefObject,
  SetStateAction,
} from 'react';
import type { default as Cropper, CropperProps } from 'react-easy-crop';
import type { Area } from 'react-easy-crop/types';
import type { ModalProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';

export type ImgCropProps = {
  quality?: number;
  fillColor?: string;

  zoomSlider?: boolean;
  rotationSlider?: boolean;
  aspectSlider?: boolean;
  showReset?: boolean;

  aspect?: number;
  minZoom?: number;
  maxZoom?: number;
  cropShape?: 'rect' | 'round';
  showGrid?: boolean;
  cropperProps?: Omit<
    CropperProps,
    | 'image'
    | 'crop'
    | 'zoom'
    | 'rotation'
    | 'aspect'
    | 'minZoom'
    | 'maxZoom'
    | 'zoomWithScroll'
    | 'cropShape'
    | 'showGrid'
    | 'onCropChange'
    | 'onZoomChange'
    | 'onRotationChange'
    | 'onCropComplete'
    | 'classes'
  >;

  modalClassName?: string;
  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;
  onModalOk?: (file: void | boolean | string | Blob | File) => void;
  onModalCancel?: () => void;
  modalProps?: Omit<
    ModalProps,
    | 'className'
    | 'title'
    | 'width'
    | 'okText'
    | 'cancelText'
    | 'onOk'
    | 'onCancel'
    | 'open'
    | 'visible'
    | 'wrapClassName'
    | 'maskClosable'
    | 'destroyOnClose'
  >;

  beforeCrop?: (file: RcFile, fileList: RcFile[]) => boolean | Promise<boolean>;
  onUploadFail?: (err: Error) => void;

  children: JSX.Element;
};

export type EasyCropRef = {
  rotation: number;
  setZoom: Dispatch<SetStateAction<number>>;
  setRotation: Dispatch<SetStateAction<number>>;
  cropPixelsRef: MutableRefObject<Area>;
};

export type EasyCropProps = {
  cropperRef: ForwardedRef<Cropper>;
  image: string;
} & Required<
  Pick<
    ImgCropProps,
    | 'zoomSlider'
    | 'rotationSlider'
    | 'aspectSlider'
    | 'showReset'
    | 'aspect'
    | 'minZoom'
    | 'maxZoom'
    | 'cropShape'
    | 'showGrid'
  >
> &
  Pick<ImgCropProps, 'cropperProps'> & { isCN: boolean };

export type OnModalOk = NonNullable<ImgCropProps['onModalOk']>;
