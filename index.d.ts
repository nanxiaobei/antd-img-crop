declare module 'antd-img-crop' {
  export interface ImgCropProps {
    width?:	number	// default: 100. If useRatio is true, it'll be ratio.
    height?: number	// default: 100. If useRatio is true, it'll be ratio.
    useRatio?: boolean	// default: false
    resize?: boolean	// default: true	If crop can resize.
    resizeAndDrag?:	boolean	// default: true	If crop can resize and drag.
    modalTitle?: string	// default: "Edit image"	Modal title.
    modalWidth?: number	// default: 520	Modal width in px.
    beforeCrop?:	() => boolean  // Execute before crop, if return false, modal will not open (NO Promise support). Ant Design Upload beforeUpload prop will execute after crop, before upload.
  }
  export class ImgCrop extends React.Component<ImgCropProps> {}
  export default ImgCrop
}
