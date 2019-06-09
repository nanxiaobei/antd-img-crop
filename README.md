# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

English | [简体中文](./README.zh-CN.md)

An image cropper for Ant Design [Upload](https://ant.design/components/upload/).

## Demo

[https://codesandbox.io/s/4qoom5p9x4](https://codesandbox.io/s/4qoom5p9x4)

## Install

```bash
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

### width

type: `number`, default: `100`

Crop width in `px`. If `useRatio` is `true`, it'll be ratio.

### height

type: `number`, default: `100`

Crop height in `px`. If `useRatio` is `true`, it'll be ratio.

### useRatio

type: `boolean`, default: `false`

If use `width` and `height` as ratio, not real `px`. And crop will fill the width or height.

e.g. `width={500} height={400}` and `width={5} height={4}` are exactly the same.

### resize

type: `boolean`, default: `true`

If crop can resize.

### resizeAndDrag

type: `boolean`, default: `true`

If crop can resize and drag.

### modalTitle

type: `string`, default: `"Edit image"`

Modal title.

### modalWidth

type: `number`, default: `520`

Modal width in `px`.

### beforeCrop

type: `function`, default: -

Execute before crop, if return `false`, modal will not open. (Not support `Promise`)

Ant Design Upload `beforeUpload` prop will execute after crop, before upload.
