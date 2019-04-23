# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

[English](./README.md) | 简体中文

图片裁切工具，用于 Ant Design 的 [Upload](https://ant.design/components/upload-cn/) 组件。

## 示例

[https://codesandbox.io/s/r0oz1z4vwp](https://codesandbox.io/s/r0oz1z4vwp)

## 安装

```bash
yarn add antd-img-crop
```

## 使用

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

### beforeCrop

类型：`function`，默认：-

图片裁切前执行，若返回 `false`，弹框将不会打开。（不支持 `Promise`）

Ant Design Upload 组件的 `beforeUpload` 属性在图片裁切后、上传前执行。

### modalTitle

类型：`string`，默认：`"编辑图片"`

弹窗标题。

### modalWidth

类型：`number`，默认：`520`

弹窗宽度。

### width

类型：`number`，默认：`100`

裁切宽度，单位 `px`。

### height

类型：`number`，默认：`100`

裁切高度，单位 `px`。

### resize

类型：`boolean`，默认：`true`

裁切是否可调整大小。

### resizeAndDrag

类型：`boolean`，默认：`true`

裁切是否可调整大小、可拖动。
