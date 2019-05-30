# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

English | [简体中文](./README.zh-CN.md)

An image cropper for Ant Design's [Upload](https://ant.design/components/upload/).

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

Crop's width in `px`.

### height

type: `number`, default: `100`

Crop's height in `px`.

### resize

type: `boolean`, default: `true`

If crop can resize.

### resizeAndDrag

type: `boolean`, default: `true`

If crop can resize and drag.

### modalTitle

type: `string`, default: `"编辑图片"`

Modal's title.

### modalWidth

type: `number`, default: `520`

Modal's width in `px`.

### beforeCrop

type: `function`, default: -

Execute before crop, if return `false`, modal will not open. (Not support `Promise`)

Ant Design Upload's `beforeUpload` prop will execute after crop, before upload.
