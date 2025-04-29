import AntButton from 'antd/es/button';
import AntSlider from 'antd/es/slider';
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
import {
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
    resetBtnText,

    modalImage,
    aspect: propAspect,
    minZoom,
    maxZoom,
    minAspect,
    maxAspect,
    cropShape,
    showGrid,

    cropperProps,
  } = props;

  const [zoom, setZoom] = useState(ZOOM_INITIAL);
  const [rotation, setRotation] = useState(ROTATION_INITIAL);
  const [aspect, setAspect] = useState(propAspect);

  const prevPropAspect = useRef(propAspect);
  if (prevPropAspect.current !== propAspect) {
    prevPropAspect.current = propAspect;
    setAspect(propAspect);
  }

  const isResetActive =
    zoom !== ZOOM_INITIAL ||
    rotation !== ROTATION_INITIAL ||
    aspect !== propAspect;

  const onReset = () => {
    setZoom(ZOOM_INITIAL);
    setRotation(ROTATION_INITIAL);
    setAspect(propAspect);
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

  const wrapperClass =
    '[display:flex] [align-items:center] [width:60%] [margin-inline:auto]';

  const buttonClass =
    '[display:flex] [align-items:center] [justify-content:center] [height:32px] [width:32px] [background:transparent] [border:0] [font-family:inherit] [font-size:18px] [cursor:pointer] disabled:[opacity:20%] disabled:[cursor:default]';

  const sliderClass = '[flex:1]';

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
          containerClassName: `${PREFIX}-container ![position:relative] [width:100%] [height:40vh] [&~section:first-of-type]:[margin-top:16px] [&~section:last-of-type]:[margin-bottom:16px]`,
          mediaClassName: `${PREFIX}-media`,
        }}
      />

      {zoomSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-zoom ${wrapperClass}`}
        >
          <button
            className={buttonClass}
            onClick={() => setZoom(+(zoom - ZOOM_STEP).toFixed(1))}
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
            onClick={() => setZoom(+(zoom + ZOOM_STEP).toFixed(1))}
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
            className={`${buttonClass} [font-size:16px]`}
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
            className={`${buttonClass} [font-size:16px]`}
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
            onClick={() => setAspect(+(aspect - ASPECT_STEP).toFixed(2))}
            disabled={aspect - ASPECT_STEP < minAspect}
          >
            ↕
          </button>
          <AntSlider
            className={sliderClass}
            min={minAspect}
            max={maxAspect}
            step={ASPECT_STEP}
            value={aspect}
            onChange={setAspect}
          />
          <button
            className={buttonClass}
            onClick={() => setAspect(+(aspect + ASPECT_STEP).toFixed(2))}
            disabled={aspect + ASPECT_STEP > maxAspect}
          >
            ↔
          </button>
        </section>
      )}

      {showReset && (zoomSlider || rotationSlider || aspectSlider) && (
        <AntButton
          className="[position:absolute] [bottom:20px]"
          style={isResetActive ? {} : { opacity: 0.3, pointerEvents: 'none' }}
          onClick={onReset}
        >
          {resetBtnText}
        </AntButton>
      )}
    </>
  );
});

export default memo(EasyCrop);
