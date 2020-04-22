# antd-img-crop

图片裁切工具，用于 Ant Design [Upload](https://ant.design/components/upload-cn/) 组件。

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)
[![npm](https://img.shields.io/npm/dt/antd-img-crop?style=flat-square)](https://www.npmtrends.com/antd-img-crop)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/antd-img-crop?style=flat-square)](https://bundlephobia.com/result?p=antd-img-crop)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/antd-img-crop?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE)

[English](./README.md) | 简体中文

## 示例

[![Edit antd-img-crop](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/antd-img-crop-4qoom5p9x4?fontsize=14)

## 安装

```sh
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

| 名称          | 类型       | 默认         | 说明                                                                                  |
| ------------- | ---------- | ------------ | ------------------------------------------------------------------------------------- |
| width         | `number`   | `100`        | 裁切所得图片的宽度，单位 `px`。                                                       |
| height        | `number`   | `100`        | 裁切所得图片的高度，单位 `px`。                                                       |
| contain       | `boolean`  | `false`      | 与 `background-size: contain` 表现一致，裁切区域将占满宽度或高度。                    |
| resize        | `boolean`  | `true`       | 裁切区域是否可调大小。                                                                |
| resizeAndDrag | `boolean`  | `true`       | 裁切区域是否可调大小且可拖动。                                                        |
| modalTitle    | `string`   | `'编辑图片'` | 弹窗标题。                                                                            |
| modalWidth    | `number`   | `520`        | 弹窗宽度，单位 `px`。                                                                 |
| beforeCrop    | `function` | -            | 若返回 `false`，弹框将不会打开，调用顺序：`beforeCrop` → 裁切 → `beforeUpload` → 上传 |
| rotate        | `boolean`  | `false`      | 图片是否可旋转                                                                        |
| rotateLabel   | `string`   | `'Rotate'`   | 旋转标识                                                                              |

> `new File` 错误？请尝试 https://github.com/jimmywarting/FormData/issues/11#issuecomment-277522987

## 协议

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
