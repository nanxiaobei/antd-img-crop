# antd-img-crop

An image cropper for Ant Design [Upload](https://ant.design/components/upload/).

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)
[![npm](https://img.shields.io/npm/dt/antd-img-crop?style=flat-square)](https://www.npmtrends.com/antd-img-crop)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/antd-img-crop?style=flat-square)](https://bundlephobia.com/result?p=antd-img-crop)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/antd-img-crop?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

## Demo

[Live demo](https://codesandbox.io/s/antd-img-crop-4qoom5p9x4)

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

| Prop        | Type                 | Default        | Description                                               |
| ----------- | -------------------- | -------------- | --------------------------------------------------------- |
| aspect      | `number`             | `1 / 1`        | Aspect of crop area , `width / height`                    |
| shape       | `string`             | `'rect'`       | Shape of crop area, `'rect'` or `'round'`                 |
| cropSize    | `{ width: number, height: number }`   | - | Size of the crop area (in pixels). If you don't provide it, it will be computed automatically using the aspect prop and the media size.
| grid        | `boolean`            | `false`        | Show grid of crop area (third-lines)                      |
| zoom        | `boolean`            | `true`         | Enable zoom for image                                     |
| rotate      | `boolean`            | `false`        | Enable rotate for image                                   |
| minZoom     | `number`             | `1`            | Minimum zoom factor                                       |
| maxZoom     | `number`             | `3`            | Maximum zoom factor                                       |
| modalTitle  | `string`             | `'Edit image'` | Title of modal                                            |
| modalWidth  | `number` \| `string` | `520`          | Width of modal in pixels number or percentages            |
| modalOk     | `string`             | `'OK'`         | Text of confirm button of modal                           |
| modalCancel | `string`             | `'Cancel'`     | Text of cancel button of modal                            |
| beforeCrop  | `function`           | -              | Call before modal open, if return `false`, it'll not open |

## Styles

To prevent overwriting the custom styles to `antd`, `antd-img-crop` does not import the style files of components.

Therefore, if your project configured `babel-plugin-import`, and not use `Modal` or `Slider`, you need to import the styles yourself:

```js
import 'antd/es/modal/style';
import 'antd/es/slider/style';
```

## License

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
