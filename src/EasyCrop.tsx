import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Cropper from 'react-easy-crop';
import AntSlider from 'antd/es/slider';
import type { EasyCropProps, EasyCropRef } from './types';
import type { Area, Point } from 'react-easy-crop/types';
import {
  INIT_ROTATE,
  INIT_ZOOM,
  MAX_RATIO,
  MAX_ROTATE,
  MIN_RATIO,
  MIN_ROTATE,
  PREFIX,
  RATIO_STEP,
  ROTATE_STEP,
  ZOOM_STEP,
} from './constants';

const EasyCrop = forwardRef<EasyCropRef, EasyCropProps>((props, ref) => {
  const {
    cropperRef,
    image,

    aspect,
    aspectAdjust,
    shape,
    grid,
    zoom,
    rotate,
    minZoom,
    maxZoom,

    cropperProps,
  } = props;

  const [crop, onCropChange] = useState<Point>({ x: 0, y: 0 });
  const [zoomVal, setZoomVal] = useState(INIT_ZOOM);
  const [ratioVal, setRatioVal] = useState(aspect);
  const [rotateVal, setRotateVal] = useState(INIT_ROTATE);
  const cropPixelsRef = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
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
        onCropChange={onCropChange}
        aspect={ratioVal}
        cropShape={shape}
        showGrid={grid}
        zoomWithScroll={zoom}
        zoom={zoomVal}
        rotation={rotateVal}
        onZoomChange={setZoomVal}
        onRotationChange={setRotateVal}
        minZoom={minZoom}
        maxZoom={maxZoom}
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
      {aspectAdjust && <section className={`${PREFIX}-control ${PREFIX}-control-zoom`}>
        <button
          onClick={() => setRatioVal(ratioVal - RATIO_STEP)}
          disabled={ratioVal - RATIO_STEP < MIN_RATIO}
        >
          ↕️
        </button>
        <AntSlider
          min={MIN_RATIO}
          max={MAX_RATIO}
          step={RATIO_STEP}
          value={ratioVal}
          onChange={setRatioVal}
        />
        <button
          onClick={() => setRatioVal(ratioVal + RATIO_STEP)}
          disabled={ratioVal + RATIO_STEP > MAX_RATIO}
        >
          ↔️
        </button>
      </section>}
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
