import * as React from 'react';

export interface ImgCropProps {
  aspect?: number;
  shape?: 'rect' | 'round';
  grid?: boolean;
  zoom?: boolean;
  rotate?: boolean;
  beforeCrop?: (file: File, fileList: File[]) => boolean;
  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;
}
declare const ImgCrop: React.FC<ImgCropProps>;
export default ImgCrop;
