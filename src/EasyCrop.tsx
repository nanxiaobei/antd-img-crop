import React, {
  forwardRef,
  memo,
  MutableRefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { Dispatch, ForwardedRef, SetStateAction } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point, Size } from 'react-easy-crop/types';
import AntSlider from 'antd/es/slider';
import type { ImgCropProps } from '../index';
import {
  INIT_ROTATE,
  INIT_ZOOM,
  MAX_ROTATE,
  MIN_ROTATE,
  PREFIX,
  ROTATE_STEP,
  ZOOM_STEP,
} from './constants';

export type EasyCropHandle = {
  rotateVal: number;
  setZoomVal: Dispatch<SetStateAction<number>>;
  setRotateVal: Dispatch<SetStateAction<number>>;
  cropPixelsRef: MutableRefObject<Area>;
};

interface EasyCropProps
  extends Required<
    Pick<
      ImgCropProps,
      | 'aspect'
      | 'shape'
      | 'grid'
      | 'zoom'
      | 'rotate'
      | 'minZoom'
      | 'maxZoom'
      | 'cropperProps'
    >
  > {
  cropperRef: ForwardedRef<Cropper>;
  image: string;
}

const EasyCrop = forwardRef<EasyCropHandle, EasyCropProps>((props, ref) => {
  const {
    cropperRef,
    image,

    aspect,
    shape,
    grid,
    zoom,
    rotate,
    minZoom,
    maxZoom,
    cropperProps,
  } = props;

  const [crop, onCropChange] = useState<Point>({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState<Size>({ width: 0, height: 0 });
  const [zoomVal, setZoomVal] = useState(INIT_ZOOM);
  const [rotateVal, setRotateVal] = useState(INIT_ROTATE);
  const cropPixelsRef = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });

  const onMediaLoaded = useCallback(
    (mediaSize) => {
      const { width, height } = mediaSize;
      const ratioWidth = height * aspect;

      if (width > ratioWidth) {
        setCropSize({ width: ratioWidth, height });
      } else {
        setCropSize({ width, height: width / aspect });
      }
    },
    [aspect]
  );

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    cropPixelsRef.current = croppedAreaPixels;
  }, []);

  useImperativeHandle(ref, () => ({
    rotateVal,
    setZoomVal,
    setRotateVal,
    cropPixelsRef,
  }));

  return (
    <>
      <Cropper
        {...cropperProps}
        ref={cropperRef}
        image={image}
        crop={crop}
        cropSize={cropSize}
        onCropChange={onCropChange}
        aspect={aspect}
        cropShape={shape}
        showGrid={grid}
        zoomWithScroll={zoom}
        zoom={zoomVal}
        rotation={rotateVal}
        onZoomChange={setZoomVal}
        onRotationChange={setRotateVal}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onMediaLoaded={onMediaLoaded}
        onCropComplete={onCropComplete}
        classes={{
          containerClassName: `${PREFIX}-container`,
          mediaClassName: `${PREFIX}-media`,
        }}
      />
      {zoom && (
        <section className={`${PREFIX}-control ${PREFIX}-control-zoom`}>
          <button
            onClick={() => setZoomVal(zoomVal - ZOOM_STEP)}
            disabled={zoomVal - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <AntSlider
            min={minZoom}
            max={maxZoom}
            step={ZOOM_STEP}
            value={zoomVal}
            onChange={setZoomVal}
          />
          <button
            onClick={() => setZoomVal(zoomVal + ZOOM_STEP)}
            disabled={zoomVal + ZOOM_STEP > maxZoom}
          >
            ＋
          </button>
        </section>
      )}
      {rotate && (
        <section className={`${PREFIX}-control ${PREFIX}-control-rotate`}>
          <button
            onClick={() => setRotateVal(rotateVal - ROTATE_STEP)}
            disabled={rotateVal === MIN_ROTATE}
          >
            ↺
          </button>
          <AntSlider
            min={MIN_ROTATE}
            max={MAX_ROTATE}
            step={ROTATE_STEP}
            value={rotateVal}
            onChange={setRotateVal}
          />
          <button
            onClick={() => setRotateVal(rotateVal + ROTATE_STEP)}
            disabled={rotateVal === MAX_ROTATE}
          >
            ↻
          </button>
        </section>
      )}
    </>
  );
});

export default memo(EasyCrop);
