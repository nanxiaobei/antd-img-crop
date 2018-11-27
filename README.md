# antd-img-crop

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)

An image cropper to wrap Upload in Ant Design

## Install

```bash
yarn add antd-img-crop
```

## Usage

```jsx harmony
import ImgCrop from 'antd-img-crop';
import { Upload } from 'antd';

<ImgCrop>
  <Upload>+</Upload>
</ImgCrop>
```

## Props

Use `width` and `height` to get ratio for crop area.

#### width (Number)

default: `100`

#### height (Number)

default: `100`
