# antd-img-crop

An image cropper for Ant Design [Upload](https://ant.design/components/upload/).

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)
[![npm](https://img.shields.io/npm/dt/antd-img-crop?style=flat-square)](https://www.npmtrends.com/antd-img-crop)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/antd-img-crop?style=flat-square)](https://bundlephobia.com/result?p=antd-img-crop)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/antd-img-crop?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

## Demo

[![Edit antd-img-crop](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/antd-img-crop-4qoom5p9x4?fontsize=14)

## Install

```sh
yarn add antd-img-crop
```

## Usage

```jsx harmony
import ImgCrop from 'antd-img-crop';
import { Upload } from 'antd';

const Demo = () => (
  <ImgCrop>
    <Upload>+ Add image</Upload>
  </ImgCrop>
);
```

## Props

| Name          | Type       | Default        | Description                                                                                                                                               |
| ------------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width         | `number`   | `100`          | Width of cropped image in `px`.                                                                                                                           |
| height        | `number`   | `100`          | Height of cropped image in `px`.                                                                                                                          |
| contain       | `boolean`  | `false`        | Consistent with `background-size: contain`, crop area will fill the width or height.                                                                      |
| ~~useRatio~~  | -          | -              | Deprecated, please use `contain`.                                                                                                                         |
| resize        | `boolean`  | `true`         | If crop area can resize.                                                                                                                                  |
| resizeAndDrag | `boolean`  | `true`         | If crop area can resize and drag.                                                                                                                         |
| modalTitle    | `string`   | `"Edit image"` | Title of modal.                                                                                                                                           |
| modalWidth    | `number`   | `520`          | Width of modal in `px`.                                                                                                                                   |
| beforeCrop    | `function` | -              | Execute before crop, modal will not open if return `false` (Not support `Promise`). `beforeUpload` prop of Upload will execute after crop, before upload. |
| rotation      | `boolean`  | `false`        | If image can rotate                                                                                                                                       |
| rotationTitle | `string`   | `"Rotation"`   | Title of rotation functionality                                                                                                                           |
| zoom          | `boolean`  | `false`        | If image can be zoomed                                                                                                                                    |
| zoomTitle     | `string`   | `"Zoom"`       | Title of zoom functionality                                                                                                                               |

> `new File` error? try https://github.com/jimmywarting/FormData/issues/11#issuecomment-277522987

## License

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
