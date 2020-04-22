// @ts-ignore
import { Component } from 'react';

declare module 'antd-img-crop' {
  export interface ImgCropProps {
    width?: number;
    height?: number;
    contain?: boolean;
    resize?: boolean;
    resizeAndDrag?: boolean;
    modalTitle?: string;
    modalWidth?: number;
    beforeCrop?: () => boolean;
    rotate?: boolean;
    rotateLabel?: string;
  }
  export class ImgCrop extends Component<ImgCropProps> {}
  export default ImgCrop;
}
