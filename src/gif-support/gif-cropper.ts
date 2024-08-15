import GIF from 'gif.js'
import { GifToCanvas } from './gif-to-canvas'
import { PREFIX } from '../constants';
import { EasyCropRef } from '../types';
import getWorkerURL from './gif-process-worker';
import { RcFile } from 'antd/es/upload';

interface CropGifOptions {
  file: RcFile,
  target: ShadowRoot,
  easyCrop: EasyCropRef,
  fillColor: string,
}

type ImgSource = CanvasImageSource & {
  naturalWidth: number;
  naturalHeight: number;
};

export function cropGif(props: CropGifOptions) {
  const { 
    file,
    target,
    easyCrop,
    fillColor,
  } = props;

  const {
    width: cropWidth,
    height: cropHeight,
    x: cropX,
    y: cropY,
  } = easyCrop.cropPixelsRef.current;

  const context = (target?.getRootNode?.() as ShadowRoot) || document;

  const imgSource = context.querySelector(`.${PREFIX}-media`) as ImgSource;
  const { naturalWidth: imgWidth, naturalHeight: imgHeight } = imgSource;

  const rotation = easyCrop.rotation || 0;

  const targetOffset = {
    dx: cropX,
    dy: cropY,
    width: imgWidth,
    height: imgHeight,
    sWidth: cropWidth,
    sHeight: cropHeight,
  };

  return new Promise<Blob>((resolve) => {
    const gifToCanvas = new GifToCanvas(file, {
      targetOffset,
      rotation,
      fillColor,
    })
    const gif = new GIF({
      workers: 4,
      quality: 10,
      workerScript: getWorkerURL(),
    })
    const addFrame = (canvas: HTMLCanvasElement, delay: number) => {
      gif.addFrame(canvas, { copy: true, delay })
    }
    gifToCanvas.on('progress', (canvas: HTMLCanvasElement, delay: number) => {
      addFrame(canvas, delay)
    })
    gifToCanvas.on('finished', (canvas: HTMLCanvasElement, delay: number) => {
      addFrame(canvas, delay)
      gif.render()
    })
    gif.on('finished', (blob) => {
      resolve(blob)
    })
    
    gifToCanvas.init()
  });
}