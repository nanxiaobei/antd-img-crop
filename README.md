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

| Prop           | Type       | Default        | Description                                                         |
| -------------- | ---------- | -------------- | ------------------------------------------------------------------- |
| quality        | `number`   | `0.4`          | Cropped image quality, `0` to `1`                                   |
| fillColor      | `string`   | `'white'`      | Fill color when cropped image smaller than canvas                   |
| zoomSlider     | `boolean`  | `true`         | Enable zoom adjustment for image                                    |
| rotationSlider | `boolean`  | `false`        | Enable rotation adjustment for image                                |
| aspectSlider   | `boolean`  | `false`        | Enable aspect adjustment for crop area                              |
| showReset      | `boolean`  | `false`        | Show a reset button to reset zoom, rotation, aspect                 |
| resetText      | `string`   | `Reset`        | Reset button text                                                   |
| aspect         | `number`   | `1 / 1`        | Aspect of crop area , `width / height`                              |
| minZoom        | `number`   | `1`            | Minimum zoom factor                                                 |
| maxZoom        | `number`   | `3`            | Maximum zoom factor                                                 |
| cropShape      | `string`   | `'rect'`       | Shape of crop area, `'rect'` or `'round'`                           |
| showGrid       | `boolean`  | `false`        | Show grid of crop area (third-lines)                                |
| cropperProps   | `object`   | -              | [react-easy-crop] props (\* existing props cannot be overridden)    |
| modalClassName | `string`   | `''`           | Provide your own classname for the Modal container                  |
| modalTitle     | `string`   | `'Edit image'` | Title of modal                                                      |
| modalWidth     | `number`   | `string`       | Width of modal in pixels number or percentages                      |
| modalOk        | `string`   |                | Text of modal confirm button                                        |
| modalCancel    | `string`   |                | Text of modal cancel button                                         |
| onModalOk      | `function` | -              | Call when click modal confirm button                                |
| onModalCancel  | `function` | -              | Call when click modal mask, top right "x", or cancel button         |
| modalProps     | `object`   |                | [Ant Design Modal] props (\* existing props cannot be overridden)   |
| beforeCrop     | `function` | -              | Call before modal open, if return `false` or reject, it'll not open |

## FAQ

### `ConfigProvider` not work?

Try to set `libraryDirectory`(`'es'` or `'lib'`) to `babel-plugin-import` config, see which one will work.

```js
module.exports = {
  plugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
};
```

### No style? (only `antd<=v4`)

If you use `antd<=v4` + `babel-plugin-import`, and no `Modal` or `Slider` were imported, please import these styles manually:

```js
import 'antd/es/modal/style';
import 'antd/es/slider/style';
```

## License

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

[react-easy-crop]: https://github.com/ricardo-ch/react-easy-crop#props
[Ant Design Modal]: https://ant.design/components/modal#api

## FUTAKE

Try [**FUTAKE**](https://sotake.com/futake) in WeChat. A mini app for your inspiration moments. 🌈

![](https://s3.bmp.ovh/imgs/2022/07/21/452dd47aeb790abd.png)

```

```
