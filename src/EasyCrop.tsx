import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop/types';
import AntSlider from 'antd/es/slider';
import {
  ASPECT_MAX,
  ASPECT_MIN,
  ASPECT_STEP,
  PREFIX,
  ROTATION_INITIAL,
  ROTATION_MAX,
  ROTATION_MIN,
  ROTATION_STEP,
  ZOOM_INITIAL,
  ZOOM_STEP,
} from './constants';
import type { EasyCropProps, EasyCropRef } from './types';

const EasyCrop = forwardRef<EasyCropRef, EasyCropProps>((props, ref) => {
  const {
    cropperRef,
    zoomSlider,
    rotationSlider,
    aspectSlider,

    image,
    aspect: propAspect,
    minZoom,
    maxZoom,
    cropShape,
    showGrid,

    cropperProps,
  } = props;

  const [crop, onCropChange] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(ZOOM_INITIAL);
  const [rotation, setRotation] = useState(ROTATION_INITIAL);
  const [aspect, setAspect] = useState(propAspect);

  const cropPixelsRef = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    cropPixelsRef.current = croppedAreaPixels;
  }, []);

  useImperativeHandle(ref, () => ({
    setZoom,
    rotation,
    setRotation,
    cropPixelsRef,
  }));

  return (
    <>
      <Cropper
        {...cropperProps}
        ref={cropperRef}
        image={image}
        crop={crop}
        //
        zoom={zoom}
        rotation={rotation}
        aspect={aspect}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomWithScroll={zoomSlider}
        //
        cropShape={cropShape}
        showGrid={showGrid}
        onCropChange={onCropChange}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onCropComplete={onCropComplete}
        classes={{
          containerClassName: `${PREFIX}-container`,
          mediaClassName: `${PREFIX}-media`,
        }}
      />

      {zoomSlider && (
        <section className={`${PREFIX}-control ${PREFIX}-control-zoom`}>
          <button
            onClick={() => setZoom(zoom - ZOOM_STEP)}
            disabled={zoom - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <AntSlider
            min={minZoom}
            max={maxZoom}
            step={ZOOM_STEP}
            value={zoom}
            onChange={setZoom}
          />
          <button
            onClick={() => setZoom(zoom + ZOOM_STEP)}
            disabled={zoom + ZOOM_STEP > maxZoom}
          >
            ＋
          </button>
        </section>
      )}

      {rotationSlider && (
        <section className={`${PREFIX}-control ${PREFIX}-control-rotation`}>
          <button
            onClick={() => setRotation(rotation - ROTATION_STEP)}
            disabled={rotation === ROTATION_MIN}
          >
            ↺
          </button>
          <AntSlider
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            step={ROTATION_STEP}
            value={rotation}
            onChange={setRotation}
          />
          <button
            onClick={() => setRotation(rotation + ROTATION_STEP)}
            disabled={rotation === ROTATION_MAX}
          >
            ↻
          </button>
        </section>
      )}

      {aspectSlider && (
        <section className={`${PREFIX}-control ${PREFIX}-control-aspect`}>
          <button
            onClick={() => setAspect(aspect - ASPECT_STEP)}
            disabled={aspect - ASPECT_STEP < ASPECT_MIN}
          >
            ↕️
          </button>
          <AntSlider
            min={ASPECT_MIN}
            max={ASPECT_MAX}
            step={ASPECT_STEP}
            value={aspect}
            onChange={setAspect}
          />
          <button
            onClick={() => setAspect(aspect + ASPECT_STEP)}
            disabled={aspect + ASPECT_STEP > ASPECT_MAX}
          >
            ↔️
          </button>
        </section>
      )}
    </>
  );
});

export default memo(EasyCrop);
