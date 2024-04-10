<div align="center">

Link in bio to **widgets**,
your online **home screen**. ➫ [🔗 kee.so](https://kee.so/)

</div>

---

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

[![Edit antd-img-crop](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/antd-img-crop-5x4j3r)

## Props

| Prop           | Type       | Default        | Description                                                                      |
| -------------- | ---------- | -------------- | -------------------------------------------------------------------------------- |
| quality        | `number`   | `0.4`          | Cropped image quality, `0` to `1`                                                |
| fillColor      | `string`   | `'white'`      | Fill color for cropped image                                                     |
| zoomSlider     | `boolean`  | `true`         | Enable zoom adjustment                                                           |
| rotationSlider | `boolean`  | `false`        | Enable rotation adjustment                                                       |
| aspectSlider   | `boolean`  | `false`        | Enable aspect adjustment                                                         |
| showReset      | `boolean`  | `false`        | Show reset button to reset zoom rotation aspect                                  |
| resetText      | `string`   | `Reset`        | Reset button text                                                                |
| aspect         | `number`   | `1 / 1`        | Aspect of crop area , `width / height`                                           |
| minZoom        | `number`   | `1`            | Minimum zoom factor                                                              |
| maxZoom        | `number`   | `3`            | Maximum zoom factor                                                              |
| cropShape      | `string`   | `'rect'`       | Shape of crop area, `'rect'` or `'round'`                                        |
| showGrid       | `boolean`  | `false`        | Show grid of crop area (third-lines)                                             |
| cropperProps   | `object`   | -              | [react-easy-crop] props (\* existing props cannot be overridden)                 |
| modalClassName | `string`   | `''`           | Modal classname                                                                  |
| modalTitle     | `string`   | `'Edit image'` | Modal title                                                                      |
| modalWidth     | `number`   | `string`       | Modal width                                                                      |
| modalOk        | `string`   |                | Ok button text                                                                   |
| modalCancel    | `string`   |                | Cancel button text                                                               |
| onModalOk      | `function` | -              | Callback of click ok button                                                      |
| onModalCancel  | `function` | -              | Callback of click cancel button (or modal mask & top right "x")                  |
| modalProps     | `object`   |                | [Ant Design Modal] props (\* existing props cannot be overridden)                |
| beforeCrop     | `function` | -              | Callback before crop modal, if return `false` or `reject()`, modal will not open |

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

[react-easy-crop]: https://github.com/ValentinH/react-easy-crop#props
[Ant Design Modal]: https://ant.design/components/modal#api
