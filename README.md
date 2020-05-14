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

| Prop       | Type                 | Default        | Description                                                     |
| ---------- | -------------------- | -------------- | --------------------------------------------------------------- |
| aspect     | `number`             | `1 / 1`        | Aspect of the crop area , `width / height`                      |
| shape      | `string`             | `'rect'`       | Shape of the crop area, `'rect'` or `'round'`                   |
| grid       | `boolean`            | `false`        | Show grid of the crop area (third-lines)                        |
| zoom       | `boolean`            | `true`         | Enable zoom for the image                                       |
| rotate     | `boolean`            | `false`        | Enable rotate for the image                                     |
| beforeCrop | `function`           | -              | Called before the model open, if return `false`, it'll not open |
| modalTitle | `string`             | `'Edit image'` | Title of the modal                                              |
| modalWidth | `number` \| `string` | `520`          | Width of the modal in pixels or percentages                     |

## License

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
