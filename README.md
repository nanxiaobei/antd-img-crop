# antd-img-crop

An image cropper for Ant Design [Upload](https://ant.design/components/upload/)

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)
[![npm](https://img.shields.io/npm/dt/antd-img-crop?style=flat-square)](https://www.npmtrends.com/antd-img-crop)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/antd-img-crop?style=flat-square)](https://bundlephobia.com/result?p=antd-img-crop)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/antd-img-crop?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/main/LICENSE)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/main/src/types.ts)

English | [简体中文](./README.zh-CN.md)

## Install

```sh
pnpm add antd-img-crop
# or
yarn add antd-img-crop
# or
npm i antd-img-crop
```

## Usage

```jsx harmony
import { Upload } from 'antd';
import ImgCrop from 'antd-img-crop';

const Demo = () => (
  <ImgCrop>
    <Upload>+ Add image</Upload>
  </ImgCrop>
);
```

[![Edit antd-img-crop](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/antd-img-crop-4qoom5p9x4?fontsize=14&hidenavigation=1&theme=dark)

## Props

| Prop                    | Type                 | Default        | Description                                                                        |
| ----------------------- | -------------------- | -------------- | ---------------------------------------------------------------------------------- |
| aspect                  | `number`             | `1 / 1`        | Aspect of crop area , `width / height`                                             |
| shape                   | `string`             | `'rect'`       | Shape of crop area, `'rect'` or `'round'`                                          |
| grid                    | `boolean`            | `false`        | Show grid of crop area (third-lines)                                               |
| quality                 | `number`             | `0.4`          | Image quality, `0 ~ 1`                                                             |
| fillColor               | `string`             | `'white'`      | Fill color when cropped image smaller than canvas                                  |
| zoom                    | `boolean`            | `true`         | Enable zoom for image                                                              |
| rotate                  | `boolean`            | `false`        | Enable rotate for image                                                            |
| minZoom                 | `number`             | `1`            | Minimum zoom factor                                                                |
| maxZoom                 | `number`             | `3`            | Maximum zoom factor                                                                |
| modalTitle              | `string`             | `'Edit image'` | Title of modal                                                                     |
| modalWidth              | `number` \| `string` | `520`          | Width of modal in pixels number or percentages                                     |
| modalOk                 | `string`             | `'OK'`         | Text of modal confirm button                                                       |
| modalCancel             | `string`             | `'Cancel'`     | Text of modal cancel button                                                        |
| modalMaskTransitionName | `string`             | `'fade'`       | MaskTransitionName of modal, use `'none'` to disable the default transition effect |
| modalTransitionName     | `string`             | `'fade'`       | TransitionName of modal, use `'none'` to disable the default transition effect     |
| modalClassName          | `string`             | `''`           | Provide your own classname for the Modal container                                 |
| onModalOk               | `function`           | -              | Call when click modal confirm button                                               |
| onModalCancel           | `function`           | -              | Call when click modal mask, top right "x", or cancel button                        |
| beforeCrop              | `function`           | -              | Call before modal open, if return `false`, it'll not open                          |
| onUploadFail            | `function`           | -              | Call when upload failed                                                            |
| cropperProps            | `object`             | -              | Props of [react-easy-crop] (\* [existing props] cannot be overridden)              |

## Before antd v5

If you use `antd<=v4` with `babel-plugin-import`, and no `Modal` or `Slider` were used in project, please import these styles manually:

```js
import 'antd/es/modal/style';
import 'antd/es/slider/style';
```

## License

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

[react-easy-crop]: https://github.com/ricardo-ch/react-easy-crop#props
[existing props]: https://github.com/nanxiaobei/antd-img-crop/blob/main/src/EasyCrop.tsx#L74-L93

## FUTAKE

Try [**FUTAKE**](https://sotake.com/futake) in WeChat. A mini app for your inspiration moments. 🌈

![](https://s3.bmp.ovh/imgs/2022/07/21/452dd47aeb790abd.png)

```

```
