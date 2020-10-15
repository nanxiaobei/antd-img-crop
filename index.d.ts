import * as React from 'react';
import { CropperProps } from 'react-easy-crop';

export interface ImgCropProps {
  aspect?: number;
  shape?: 'rect' | 'round';
  grid?: boolean;

  zoom?: boolean;
  rotate?: boolean;
  minZoom?: number;
  maxZoom?: number;

  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;

  beforeCrop?: (file: File, fileList: File[]) => boolean;

  cropperProps: CropperProps
}
declare const ImgCrop: React.FC<ImgCropProps>;
export default ImgCrop;
