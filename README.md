# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

English | [简体中文](./README.zh-CN.md)

An image cropper for Ant Design's [Upload](https://ant.design/components/upload/).

## Demo

[https://codesandbox.io/s/r0oz1z4vwp](https://codesandbox.io/s/r0oz1z4vwp)

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

#### beforeCrop

type: `function`, default: -

Execute before crop, if return `false`, modal will not open. (Not support `Promise`)

Ant Design Upload's `beforeUpload` prop will execute after crop, before upload.

#### modalTitle

type: `string`, default: `"编辑图片"`, modal's title.

#### modalWidth

type: `number`, default: `520`, modal's width.

#### width

type: `number`, default: `100`, crop's width in `px`.

#### height

type: `number`, default: `100`, crop's height in `px`.

#### resize

type: `boolean`, default: `true`, if crop can resize.

#### resizeAndDrag

type: `boolean`, default: `true`, if crop can resize and drag.
