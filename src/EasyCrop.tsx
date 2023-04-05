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
import AntButton from 'antd/es/button';
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
    showReset,

    modalImage,
    aspect: ASPECT_INITIAL,
    minZoom,
    maxZoom,
    cropShape,
    showGrid,

    cropperProps,
    isCN,
  } = props;

  const [zoom, setZoom] = useState(ZOOM_INITIAL);
  const [rotation, setRotation] = useState(ROTATION_INITIAL);
  const [aspect, setAspect] = useState(ASPECT_INITIAL);

  const isResetActive =
    zoom !== ZOOM_INITIAL ||
    rotation !== ROTATION_INITIAL ||
    aspect !== ASPECT_INITIAL;

  const onReset = () => {
    setZoom(ZOOM_INITIAL);
    setRotation(ROTATION_INITIAL);
    setAspect(ASPECT_INITIAL);
  };

  const [crop, onCropChange] = useState<Point>({ x: 0, y: 0 });
  const cropPixelsRef = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    cropPixelsRef.current = croppedAreaPixels;
  }, []);

  useImperativeHandle(ref, () => ({
    rotation,
    cropPixelsRef,
    onReset,
  }));

  const wrapperClass = 'flex items-center w-3/5 mx-auto';
  const buttonClass =
    'flex items-center justify-center w-8 h-8 bg-transparent border-0 font-[inherit] text-[18px] cursor-pointer disabled:opacity-20 disabled:cursor-default';
  const sliderClass = 'flex-1 mx-2';

  return (
    <>
      <Cropper
        {...cropperProps}
        ref={cropperRef}
        image={modalImage}
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
          containerClassName: `${PREFIX}-container !relative w-full h-[40vh] [&~section:first-of-type]:mt-4 [&~section:last-of-type]:mb-4`,
          mediaClassName: `${PREFIX}-media`,
        }}
      />

      {zoomSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-zoom ${wrapperClass}`}
        >
          <button
            className={buttonClass}
            onClick={() => setZoom(zoom - ZOOM_STEP)}
            disabled={zoom - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <AntSlider
            className={sliderClass}
            min={minZoom}
            max={maxZoom}
            step={ZOOM_STEP}
            value={zoom}
            onChange={setZoom}
          />
          <button
            className={buttonClass}
            onClick={() => setZoom(zoom + ZOOM_STEP)}
            disabled={zoom + ZOOM_STEP > maxZoom}
          >
            ＋
          </button>
        </section>
      )}

      {rotationSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-rotation ${wrapperClass}`}
        >
          <button
            className={`${buttonClass} !text-[16px]`}
            onClick={() => setRotation(rotation - ROTATION_STEP)}
            disabled={rotation === ROTATION_MIN}
          >
            ↺
          </button>
          <AntSlider
            className={sliderClass}
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            step={ROTATION_STEP}
            value={rotation}
            onChange={setRotation}
          />
          <button
            className={`${buttonClass} !text-[16px]`}
            onClick={() => setRotation(rotation + ROTATION_STEP)}
            disabled={rotation === ROTATION_MAX}
          >
            ↻
          </button>
        </section>
      )}

      {aspectSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-aspect ${wrapperClass}`}
        >
          <button
            className={buttonClass}
            onClick={() => setAspect(aspect - ASPECT_STEP)}
            disabled={aspect - ASPECT_STEP < ASPECT_MIN}
          >
            ↕️
          </button>
          <AntSlider
            className={sliderClass}
            min={ASPECT_MIN}
            max={ASPECT_MAX}
            step={ASPECT_STEP}
            value={aspect}
            onChange={setAspect}
          />
          <button
            className={buttonClass}
            onClick={() => setAspect(aspect + ASPECT_STEP)}
            disabled={aspect + ASPECT_STEP > ASPECT_MAX}
          >
            ↔️
          </button>
        </section>
      )}

      {showReset && (zoomSlider || rotationSlider || aspectSlider) && (
        <AntButton
          className="absolute bottom-[20px]"
          style={isResetActive ? {} : { opacity: 0.3, pointerEvents: 'none' }}
          onClick={onReset}
        >
          {isCN ? '重置' : 'Reset'}
        </AntButton>
      )}
    </>
  );
});

export default memo(EasyCrop);
