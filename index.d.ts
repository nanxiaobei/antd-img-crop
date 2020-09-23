import * as React from 'react';

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
}
declare const ImgCrop: React.FC<ImgCropProps>;
export default ImgCrop;
