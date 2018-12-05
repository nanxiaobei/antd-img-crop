# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

An image cropper to wrap [Upload](https://ant.design/components/upload/) in Ant Design

## Demo

[https://codesandbox.io/s/y3y6y80yk1](https://codesandbox.io/s/y3y6y80yk1)

## Install

```bash
yarn add antd-img-crop
```

## Usage

```jsx harmony
import ImgCrop from 'antd-img-crop';
import { Upload } from 'antd';

return (
  <ImgCrop>
    <Upload>+ Add image</Upload>
  </ImgCrop>
);
```

## Props

#### modalTitle

type: `string`, default: `"编辑图片"`

#### width

type: `number`, default: `100`

#### height

type: `number`, default: `100`

Use `width` and `height` to get ratio for crop area. (Not use them as the real length)

#### scale

type: `number`, default: `80`

Use `scale` for the crop area size. (e.g. if `scale = 100`, then crop area will fill the full width or height)
