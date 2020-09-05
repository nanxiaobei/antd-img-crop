/*
 * @Description: 注释
 * @Date: 2020-09-05 14:44:28
 * @LastEditTime: 2020-09-05 21:36:23
 * @LastEditors: chenwei
 */
import * as React from 'react';

export interface ImgCropProps {
  aspect?: number;
  shape?: 'rect' | 'round';
  grid?: boolean;
  zoom?: boolean;
  rotate?: boolean;
  beforeCrop?: (file: File, fileList: File[]) => boolean;
  gifCrop?: boolean,
  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;
}
declare const ImgCrop: React.FC<ImgCropProps>;
export default ImgCrop;
