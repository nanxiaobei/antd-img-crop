# antd-img-crop

图片裁切工具，用于 Ant Design [Upload](https://ant.design/components/upload-cn/) 组件

[![npm](https://img.shields.io/npm/v/antd-img-crop.svg?style=flat-square)](https://www.npmjs.com/package/antd-img-crop)
[![npm](https://img.shields.io/npm/dt/antd-img-crop?style=flat-square)](https://www.npmtrends.com/antd-img-crop)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/antd-img-crop?style=flat-square)](https://bundlephobia.com/result?p=antd-img-crop)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/antd-img-crop?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/main/LICENSE)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/antd-img-crop/blob/main/src/types.ts)

[English](./README.md) | 简体中文

## 安装

```sh
pnpm add antd-img-crop
# or
yarn add antd-img-crop
# or
npm i antd-img-crop
```

## 使用

```jsx harmony
import { Upload } from 'antd';
import ImgCrop from 'antd-img-crop';

const Demo = () => (
  <ImgCrop>
    <Upload>+ Add image</Upload>
  </ImgCrop>
);
```

[![Edit antd-img-crop](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/antd-img-crop-4qoom5p9x4?fontsize=14&hidenavigation=1&theme=dark)

## Props

| 属性           | 类型                 | 默认         | 说明                                                     |
| -------------- | -------------------- | ------------ | -------------------------------------------------------- |
| quality        | `number`             | `0.4`        | 裁切图片质量，`0` 到 `1` 之间                            |
| fillColor      | `string`             | `'white'`    | 裁切图像小于画布时的填充颜色                             |
| zoomSlider     | `boolean`            | `true`       | 启用图片缩放调整                                         |
| rotationSlider | `boolean`            | `false`      | 启用图片旋转调整                                         |
| aspectSlider   | `boolean`            | `false`      | 启用裁切比率调整                                         |
| showReset      | `boolean`            | `false`      | 显示重置按钮，用以重置缩放、旋转、比率                   |
| resetText      | `string`             | `重置`       | 重置按钮文字                                             |
| aspect         | `number`             | `1 / 1`      | 裁切区域宽高比，`width / height`                         |
| minZoom        | `number`             | `1`          | 最小缩放倍数                                             |
| maxZoom        | `number`             | `3`          | 最大缩放倍数                                             |
| cropShape      | `string`             | `'rect'`     | 裁切区域形状，`'rect'` 或 `'round'`                      |
| showGrid       | `boolean`            | `false`      | 显示裁切区域网格（九宫格）                               |
| cropperProps   | `object`             | -            | [react-easy-crop] 的 props（\* 已有 props 无法重写）     |
| modalClassName | `string`             | `''`         | 为 Modal 容器提供您自己的类名                            |
| modalTitle     | `string`             | `'编辑图片'` | 弹窗标题                                                 |
| modalWidth     | `number` \| `string` |              | 弹窗宽度，`px` 的数值或百分比                            |
| modalOk        | `string`             |              | 弹窗确定按钮文字                                         |
| modalCancel    | `string`             |              | 弹窗取消按钮文字                                         |
| onModalOK      | `function`           | -            | 点击弹窗确定回调                                         |
| onModalCancel  | `function`           | -            | 点击弹窗遮罩层、右上角叉、取消的回调                     |
| modalProps     | `object`             |              | [Ant Design Modal] 的 props（\* 已有 props 无法重写）    |
| beforeCrop     | `function`           | -            | 弹窗打开前调用，若返回 `false` 或 reject，弹框将不会打开 |

## FAQ

### `ConfigProvider` 无效？

尝试设置 `libraryDirectory`（`'es'` 或 `'lib'`）到 `babel-plugin-import` 的配置项，看看哪个会生效。

```js
module.exports = {
  plugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
};
```

### 没有样式？（仅 `antd<=v4`）

若使用 `antd<=v4` + `babel-plugin-import`，且未引入 `Modal` 或 `Slider`，请手动引入这些样式：

```js
import 'antd/es/modal/style';
import 'antd/es/slider/style';
```

## 协议

[MIT License](https://github.com/nanxiaobei/antd-img-crop/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

[react-easy-crop]: https://github.com/ricardo-ch/react-easy-crop#props
[Ant Design Modal]: https://ant.design/components/modal-cn#api

## FUTAKE

试试 [**FUTAKE**](https://sotake.com/futake) 小程序，你的灵感相册。🌈

![](https://s3.bmp.ovh/imgs/2022/07/21/452dd47aeb790abd.png)
