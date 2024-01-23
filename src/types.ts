import type { ModalProps, UploadProps, ThemeConfig } from 'antd';
import type { ForwardedRef, MutableRefObject } from 'react';
import type { default as Cropper, CropperProps } from 'react-easy-crop';
import type { Area } from 'react-easy-crop/types';

export type BeforeUpload = Exclude<UploadProps['beforeUpload'], undefined>;
export type BeforeUploadReturnType = ReturnType<BeforeUpload>;

export type ImgCropProps = {
  theme?: ThemeConfig
  quality?: number;
  fillColor?: string;

  zoomSlider?: boolean;
  rotationSlider?: boolean;
  aspectSlider?: boolean;
  showReset?: boolean;
  resetText?: string;

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
  onModalOk?: (value: BeforeUploadReturnType) => void;
  onModalCancel?: (resolve: (value: BeforeUploadReturnType) => void) => void;
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

  beforeCrop?: BeforeUpload;
  children: JSX.Element;
};

export type EasyCropRef = {
  rotation: number;
  cropPixelsRef: MutableRefObject<Area>;
  onReset: () => void;
};

export type EasyCropProps = {
  cropperRef: ForwardedRef<Cropper>;
  modalImage: string;
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
  Pick<ImgCropProps, 'cropperProps'> & { resetBtnText: string };
