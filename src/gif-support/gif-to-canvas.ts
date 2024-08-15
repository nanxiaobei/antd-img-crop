
type ListenerFn = (canvas: HTMLCanvasElement, delay: number) => void
type Listener = {
  'finished': ListenerFn
  'progress': ListenerFn
}

type TargetOffset = {
  dx: number
  dy: number
  width: number
  height: number
  sWidth: number
  sHeight: number
}

interface GifToCanvasOptions {
  canvasEl?: HTMLCanvasElement | null
  hasCanvasDom?: boolean
  clear?: boolean
  targetOffset?: TargetOffset
  autoPlay?: boolean
  rotation?: number
  fillColor?: string
}

interface PlayerOptions {
  frames: { data: ImageData; delay: number | null }[]
  frameOffsets: { x: number; y: number }[]
  tmpCanvas: HTMLCanvasElement
  canvas: HTMLCanvasElement
  rotateCanvas: HTMLCanvasElement
  targetOffset: TargetOffset
  hasCanvasDom?: boolean
  loopDelay?: number
  autoPlay?: boolean
  roation?: number
  fillColor?: string
  onClear?: () => void
  onFrame?: ListenerFn
  onFrameFinish?: ListenerFn
}

interface DefaultHandler {
  type: 'img' | 'eof' | 'ext'
  sentinel: number
}
interface HeaderHandle {
  bgColor: number
  colorRes: number
  gct: number[][]
  gctSize: number
  height: number
  pixelAspectRatio: number
  sig: string
  ver: string
  width: number
  sorted?: boolean
  gctFlag?: boolean
}
interface ImgHandler extends DefaultHandler {
  height: number
  lct: number[][]
  lctSize: number
  leftPos: number
  topPos: number
  lzwMinCodeSize: number
  pixels: number[]
  reserved: boolean[]
  width: number
  sorted?: boolean
  interlaced?: boolean
  lctFlag?: boolean
}
interface ExtHandler extends DefaultHandler {
  delayTime: number
  disposalMethod: number
  extType: string
  label: number
  reserved: boolean[]
  terminator: number
  comment: string
  transparencyIndex: number
  ptHeader: number[]
  ptData: string
  unknown: number
  iterations: number
  appData: string
  identifier: string
  authCode: string
  data: string
  transparencyGiven?: boolean
  userInput?: boolean
}
type HandlerBlock = DefaultHandler | ImgHandler | ExtHandler | HeaderHandle
type HandleFn = (block: HandlerBlock) => void

interface Handler {
  hdr: HandleFn
  gce: HandleFn
  img: HandleFn
  eof: HandleFn
  app: {
    NETSCAPE: HandleFn
    [k: string]: HandleFn
  }
  com?: HandleFn
  pte?: HandleFn
  unknown?: HandleFn
}
// Generic functions
const bitsToNum = function (ba: boolean[]) {
  return ba.reduce(function (s, n) {
    return s * 2 + Number(n)
  }, 0)
}

const byteToBitArr = function (bite: number) {
  const a = []
  for (let i = 7; i >= 0; i--) {
    a.push(!!(bite & (1 << i)))
  }
  return a
}

/**
 * 读取数据
 *
 * @class Stream
 */
class Stream {
  pos = 0
  data: Uint8Array | string
  constructor(data: Uint8Array | string) {
    this.data = data
  }

  readByte() {
    if (this.pos >= this.data.length) {
      throw new Error('Attempted to read past end of stream.')
    }
    if (this.data instanceof Uint8Array) return this.data[this.pos++]
    else return this.data.charCodeAt(this.pos++) & 0xff
  }
  readBytes(n: number) {
    const bytes = []
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte())
    }
    return bytes
  }
  read(n: number) {
    let s = ''
    for (let i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte())
    }
    return s
  }
  readUnsigned() {
    const a = this.readBytes(2)
    return (a[1] << 8) + a[0]
  }
}

/**
 * 转换请求回来的Gif数据
 *
 * @class ParseGif
 */
class ParseGif {
  stream: Stream
  handler: Handler
  constructor(stream: Stream, handler: Handler) {
    this.stream = stream
    this.handler = handler
  }
  init() {
    return new Promise((resolve, reject) => {
      this.parseHeader()
      const timer = setTimeout(() => {
        clearTimeout(timer)
        try {
          this.parseBlock()
          resolve(null)
        } catch (e) {
          reject(e)
        }
      }, 0)
    })
  }
  parseBlock() {
    const block = {} as DefaultHandler
    block.sentinel = this.stream.readByte()
    switch (
      String.fromCharCode(block.sentinel) // For ease of matching
    ) {
      case '!':
        block.type = 'ext'
        this.parseExt(block as ExtHandler)
        break
      case ',':
        block.type = 'img'
        this.parseImg(block as ImgHandler)
        break
      case ';':
        block.type = 'eof'
        this.handler.eof(block)
        break
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)) // TODO: Pad this with a 0.
    }
    if (block.type !== 'eof') {
      this.parseBlock()
    }
  }

  parseCT(entries: number) {
    // Each entry is 3 bytes, for RGB.
    const ct = []
    for (let i = 0; i < entries; i++) {
      ct.push(this.stream.readBytes(3))
    }
    return ct
  }
  lzwDecode(minCodeSize: number, data: string) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    let pos = 0 // Maybe this streaming thing should be merged with the Stream?
    const readCode = function (size: number) {
      let code = 0
      for (let i = 0; i < size; i++) {
        if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
          code |= 1 << i
        }
        pos++
      }
      return code
    }

    const output: number[] = []
    const clearCode = 1 << minCodeSize
    const eoiCode = clearCode + 1

    let codeSize = minCodeSize + 1

    let dict: number[][] = []

    const clear = function () {
      dict = []
      codeSize = minCodeSize + 1
      for (let i = 0; i < clearCode; i++) {
        dict[i] = [i]
      }
      dict[clearCode] = []
      dict[eoiCode] = null as any
    }

    let code
    let last

    while (true) {
      last = code
      code = readCode(codeSize)

      if (code === clearCode) {
        clear()
        continue
      }
      if (code === eoiCode) break

      if (code < dict.length) {
        if (last !== clearCode) {
          dict.push(dict[last as number].concat(dict[code][0]))
        }
      } else {
        if (code !== dict.length) throw new Error('Invalid LZW code.')
        dict.push(dict[last as number].concat(dict[last as number][0]))
      }
      // eslint-disable-next-line prefer-spread
      output.push.apply(output, dict[code])

      if (dict.length === 1 << codeSize && codeSize < 12) {
        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        codeSize++
      }
    }

    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output
  }
  parseImg(img: ImgHandler) {
    const st = this.stream
    const deinterlace = (pixels: number[], width: number) => {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      const newPixels: number[] = new Array(pixels.length)
      const rows = pixels.length / width
      const cpRow = (toRow: number, fromRow: number) => {
        const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width)
        // eslint-disable-next-line prefer-spread
        newPixels.splice.apply(newPixels, [toRow * width, width, ...fromPixels])
      }

      // See appendix E.
      const offsets = [0, 4, 2, 1]
      const steps = [8, 8, 4, 2]

      let fromRow = 0
      for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow)
          fromRow++
        }
      }

      return newPixels
    }

    img.leftPos = st.readUnsigned()
    img.topPos = st.readUnsigned()
    img.width = st.readUnsigned()
    img.height = st.readUnsigned()

    const bits = byteToBitArr(st.readByte())
    img.lctFlag = bits.shift()
    img.interlaced = bits.shift()
    img.sorted = bits.shift()
    img.reserved = bits.splice(0, 2)
    img.lctSize = bitsToNum(bits.splice(0, 3))

    if (img.lctFlag) {
      img.lct = this.parseCT(1 << (img.lctSize + 1))
    }

    img.lzwMinCodeSize = st.readByte()

    const lzwData = this.readSubBlocks()

    img.pixels = this.lzwDecode(img.lzwMinCodeSize, lzwData)

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width)
    }
    this.handler.img(img)
  }

  readSubBlocks() {
    let size, data
    data = ''
    do {
      size = this.stream.readByte()
      data += this.stream.read(size)
    } while (size !== 0)
    return data
  }
  parseExt(block: ExtHandler) {
    const parseGCExt = (block: ExtHandler) => {
      this.stream.readByte() // Always 4
      const bits = byteToBitArr(this.stream.readByte())
      block.reserved = bits.splice(0, 3) // Reserved; should be 000.
      block.disposalMethod = bitsToNum(bits.splice(0, 3))
      block.userInput = bits.shift()
      block.transparencyGiven = bits.shift()

      block.delayTime = this.stream.readUnsigned()

      block.transparencyIndex = this.stream.readByte()

      block.terminator = this.stream.readByte()
      this.handler.gce(block)
    }

    const parseComExt = (block: ExtHandler) => {
      block.comment = this.readSubBlocks()
      this.handler.com?.(block)
    }

    const parsePTExt = (block: ExtHandler) => {
      // No one *ever* uses this. If you use it, deal with parsing it yourself.
      this.stream.readByte() // Always 12
      block.ptHeader = this.stream.readBytes(12)
      block.ptData = this.readSubBlocks()
      this.handler.pte?.(block)
    }

    const parseAppExt = (block: ExtHandler) => {
      const parseNetscapeExt = (block: ExtHandler) => {
        this.stream.readByte() // Always 3
        block.unknown = this.stream.readByte() // ??? Always 1? What is this?
        block.iterations = this.stream.readUnsigned()
        block.terminator = this.stream.readByte()
        this.handler.app.NETSCAPE(block)
      }

      const parseUnknownAppExt = (block: ExtHandler) => {
        block.appData = this.readSubBlocks()
        // FIXME: This won't work if a handler wants to match on any identifier.
        this.handler.app[block.identifier]?.(block)
      }

      this.stream.readByte() // Always 11
      block.identifier = this.stream.read(8)
      block.authCode = this.stream.read(3)
      switch (block.identifier) {
        case 'NETSCAPE':
          parseNetscapeExt(block)
          break
        default:
          parseUnknownAppExt(block)
          break
      }
    }

    const parseUnknownExt = (block: ExtHandler) => {
      block.data = this.readSubBlocks()
      this.handler.unknown?.(block)
    }

    block.label = this.stream.readByte()
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce'
        parseGCExt(block)
        break
      case 0xfe:
        block.extType = 'com'
        parseComExt(block)
        break
      case 0x01:
        block.extType = 'pte'
        parsePTExt(block)
        break
      case 0xff:
        block.extType = 'app'
        parseAppExt(block)
        break
      default:
        block.extType = 'unknown'
        parseUnknownExt(block)
        break
    }
  }
  parseHeader() {
    const stream = this.stream
    const hdr = {} as HeaderHandle
    hdr.sig = stream.read(3)
    hdr.ver = stream.read(3)
    if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.') // XXX: This should probably be handled more nicely.
    hdr.width = stream.readUnsigned()
    hdr.height = stream.readUnsigned()

    const bits = byteToBitArr(stream.readByte())
    hdr.gctFlag = bits.shift()
    hdr.colorRes = bitsToNum(bits.splice(0, 3))
    hdr.sorted = bits.shift()
    hdr.gctSize = bitsToNum(bits.splice(0, 3))

    hdr.bgColor = stream.readByte()
    hdr.pixelAspectRatio = stream.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (hdr.gctFlag) {
      hdr.gct = this.parseCT(1 << (hdr.gctSize + 1))
    }
    this.handler.hdr(hdr)
  }
}

class Player {
  playing = false
  forward = true
  i = -1
  options = {
    loopDelay: 0,
    autoPlay: false,
    roation: 0,
    fillColor: 'white',
  } as PlayerOptions
  constructor(options: PlayerOptions) {
    this.options = {
      ...this.options,
      ...options
    }
  }
  putFrame() {
    this.i = parseInt(String(this.i), 10)

    if (this.i > this.options.frames.length - 1) {
      this.i = 0
    }

    if (this.i < 0) {
      this.i = 0
    }
    
    const { roation, targetOffset, frameOffsets, tmpCanvas, frames, canvas, fillColor } = this.options
    
    const offset = frameOffsets[this.i]
    tmpCanvas
      .getContext('2d')
      ?.putImageData(frames[this.i].data, offset.x, offset.y)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.globalCompositeOperation = 'copy'
    
    if (!!roation) {
      const { rotateCanvas } = this.options
      // draw rotated image
      const imgX = (rotateCanvas.width - tmpCanvas.width) / 2;
      const imgY = (rotateCanvas.height - tmpCanvas.height) / 2;
      const rotateCtx = rotateCanvas.getContext('2d') as CanvasRenderingContext2D
      rotateCtx.clearRect(0, 0, rotateCanvas.width, rotateCanvas.height)
      ctx.fillStyle = fillColor!;
      rotateCtx.fillRect(0, 0, rotateCanvas.width, rotateCanvas.height)
      rotateCtx.globalCompositeOperation = 'copy'
      rotateCtx.drawImage(tmpCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height, imgX, imgY, tmpCanvas.width, tmpCanvas.height)
      ctx.drawImage(rotateCanvas, targetOffset.dx, targetOffset.dy, targetOffset.sWidth, targetOffset.sHeight, 0, 0, targetOffset.sWidth, targetOffset.sHeight)
      return;
    }
    
    ctx.drawImage(tmpCanvas, targetOffset.dx, targetOffset.dy, targetOffset.sWidth, targetOffset.sHeight, 0, 0, targetOffset.sWidth, targetOffset.sHeight)
  }
  getNextFrameNo() {
    const delta = this.forward ? 1 : -1
    return (
      (this.i + delta + this.options.frames.length) % this.options.frames.length
    )
  }

  stepFrame(amount: number) {
    this.i = this.i + amount
    this.putFrame()
  }
  step() {
    let stepping = false
    let timer: any = null

    const completeLoop = () => {
      if (this.options.autoPlay) {
        doStep()
      } else {
        stepping = false
        this.playing = false
        this.options.onClear?.()
      }
    }

    const doStep = () => {
      timer && clearTimeout(timer)
      stepping = this.playing
      if (!stepping) return
      this.stepFrame(1)
      let delay = (this.options.frames[this.i].delay ?? 0) * 10
      if (!delay) delay = 100 // FIXME: Should this even default at all? What should it be?

      const nextFrameNo = this.getNextFrameNo()
      if (nextFrameNo === 0) {
        this.options.onFrameFinish?.(this.options.canvas, delay)
        delay += this.options.loopDelay ?? 0
        timer = setTimeout(completeLoop, delay)
      } else {
        this.options.onFrame?.(this.options.canvas, delay)
        timer = setTimeout(doStep, delay)
      }
    }
    doStep()
  }

  play() {
    this.playing = true
    this.step()
  }
  init() {
    this.play()
  }
}

/**
 * Git转Canvas
 *
 * @export
 * @class GifToCanvas
 */
export class GifToCanvas {
  static canvas: HTMLCanvasElement
  originFile: File
  listener = {} as Listener
  options = {
    hasCanvasDom: false,
    autoPlay: false,
    targetOffset: {
      dx: 0,
      dy: 0,
    },
    rotation: 0,
    fillColor: 'white',
  } as GifToCanvasOptions
  hdr = {} as HeaderHandle
  handler = {} as Handler
  canvas: HTMLCanvasElement
  tmpCanvas = document.createElement('canvas')
  rotateCanvas: HTMLCanvasElement
  transparency: number | null = null
  disposalMethod: number | null = null
  lastDisposalMethod: number | null = null
  disposalRestoreFromIdx: number | null = null
  delay: number | null = null
  lastImg: ImgHandler | null = null
  frame: CanvasRenderingContext2D | null = null
  frames: { data: ImageData; delay: number | null }[] = []
  frameOffsets: {x: number; y: number}[] = []
  constructor(file: File, options: GifToCanvasOptions = {}) {
    this.options = {
      ...this.options,
      ...options,
    }
    this.rotateCanvas = document.createElement('canvas')
    this.originFile = file
    this.canvas = GifToCanvas.canvas = this.options.canvasEl || GifToCanvas.canvas || document.createElement('canvas')
  }

  async init() {
    if (this.options.hasCanvasDom) {
      this.initDom()
    }
    await this.load()
  }
  initDom() {
    if (!this.options.canvasEl) {
      document.body.appendChild(this.canvas)
    }
  }
  async load() {
    const data = await this.getBuffer(this.originFile)
    const stream = new Stream(new Uint8Array(data))
    this.handler = this.createHandle()
    const parseGIF = new ParseGif(stream, this.handler)
    await parseGIF.init()
    const player = new Player({
      frames: this.frames,
      frameOffsets: this.frameOffsets,
      tmpCanvas: this.tmpCanvas,
      rotateCanvas: this.rotateCanvas,
      canvas: this.canvas,
      hasCanvasDom: this.options.hasCanvasDom,
      autoPlay: this.options.autoPlay,
      targetOffset: this.options.targetOffset as TargetOffset,
      roation: this.options.rotation,
      fillColor: this.options.fillColor,
      onClear: this.onClear.bind(this),
      onFrame: this.listener.progress,
      onFrameFinish: this.listener.finished
    })
    player.init()
  }

  on(event: 'finished' | 'progress', fn: ListenerFn) {
    this.listener[event] = fn
  }

  /**
   * 设置canvas尺寸
   *
   * @memberof GifToCanvas
   */
  setCanvas() {
    const targetOffset = this.options.targetOffset
    if (targetOffset?.width) {
      const l = this.hdr.width / targetOffset.width
      this.options.targetOffset = {
        ...targetOffset,
        dx: targetOffset.dx * l,
        dy: targetOffset.dy * l,
        sWidth: targetOffset.sWidth * l,
        sHeight: targetOffset.sHeight * l,
      }

      
      this.canvas.width = this.options.targetOffset.sWidth
      this.canvas.height = this.options.targetOffset.sHeight
    }
    
    this.tmpCanvas.width = this.hdr.width
    this.tmpCanvas.height = this.hdr.height

    this.setRotationCanvas();
  }

  setRotationCanvas() {
    const { rotation } = this.options

    if (rotation) {
      const { width, height } = this.hdr;

      const angle = rotation * Math.PI / 180
      const cos = Math.abs(Math.cos(angle))
      const sin = Math.abs(Math.sin(angle))
      const squareWidth = width * cos + height * sin
      const squareHeight = width * sin + height * cos
      this.rotateCanvas.width = squareWidth
      this.rotateCanvas.height = squareHeight

      // rotate container
      const squareHalfWidth = squareWidth / 2;
      const squareHalfHeight = squareHeight / 2;
      const ctx = this.rotateCanvas.getContext('2d') as CanvasRenderingContext2D
      ctx.translate(squareHalfWidth, squareHalfHeight);
      ctx.rotate(angle);
      ctx.translate(-squareHalfWidth, -squareHalfHeight);
    }
  }

  /**
   * 清除Dom节点
   *
   * @memberof GifToCanvas
   */
   onClear() {
    this.tmpCanvas.getContext('2d')?.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height)
    this.canvas?.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.frames = []
    this.clear()
    if (this.options.clear) {
      this.canvas?.parentNode?.removeChild(this.canvas)
    }
  }

  /**
   * Get Gif Data
   *
   * @param {string} url
   * @returns
   * @memberof GifToCanvas
   */
  getBuffer(file: File) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer)
      }
      reader.onerror = (e) => {
        reject(e)
      }
    });
  }
  clear() {
    this.transparency = null
    this.delay = null
    this.lastDisposalMethod = this.disposalMethod
    this.disposalMethod = null
    this.frame = null
  }
  pushFrame() {
    if (!this.frame) return
    this.frames.push({
      data: this.frame.getImageData(0, 0, this.hdr.width, this.hdr.height),
      delay: this.delay,
    })
    this.frameOffsets.push({ x: 0, y: 0 })
  }
  doHdr(hdr: HeaderHandle) {
    this.hdr = hdr
    this.setCanvas()
  }
  doGCE(gce: ExtHandler) {
    this.pushFrame()
    this.clear()
    this.transparency = gce.transparencyGiven ? gce.transparencyIndex : null
    this.delay = gce.delayTime
    this.disposalMethod = gce.disposalMethod
  }
  doNothing() {
    return null
  }
  doImg(img: ImgHandler) {
    if (!this.frame) this.frame = this.tmpCanvas.getContext('2d')

    if (!this.frame) return

    const currIdx = this.frames.length

    //ct = color table, gct = global color table
    const ct = img.lctFlag ? img.lct : this.hdr.gct // TODO: What if neither exists?

    /*
    Disposal method indicates the way in which the graphic is to
    be treated after being displayed.

    Values :    0 - No disposal specified. The decoder is
                    not required to take any action.
                1 - Do not dispose. The graphic is to be left
                    in place.
                2 - Restore to background color. The area used by the
                    graphic must be restored to the background color.
                3 - Restore to previous. The decoder is required to
                    restore the area overwritten by the graphic with
                    what was there prior to rendering the graphic.

                    Importantly, "previous" means the frame state
                    after the last disposal of method 0, 1, or 2.
    */

    if (currIdx > 0) {
      if (this.lastDisposalMethod === 3) {
        // Restore to previous
        // If we disposed every frame including first frame up to this point, then we have
        // no composited frame to restore to. In this case, restore to background instead.
        if (this.disposalRestoreFromIdx !== null) {
          this.frame.putImageData(
            this.frames[this.disposalRestoreFromIdx].data,
            0,
            0
          )
        } else {
          if (this.lastImg) {
            this.frame.clearRect(
              this.lastImg.leftPos,
              this.lastImg.topPos,
              this.lastImg.width,
              this.lastImg.height
            )
            // this.frame.clearRect(
            //   0,
            //   0,
            //   this.tmpCanvas.width,
            //   this.tmpCanvas.height
            // )
          }
        }
      } else {
        this.disposalRestoreFromIdx = currIdx - 1
      }

      if (this.lastDisposalMethod === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        if (this.lastImg) {
          this.frame.clearRect(
            this.lastImg.leftPos,
            this.lastImg.topPos,
            this.lastImg.width,
            this.lastImg.height
          )
          // this.frame.clearRect(
          //   0,
          //   0,
          //   this.tmpCanvas.width,
          //   this.tmpCanvas.height
          // )
        }
      }
    }
    // else, Undefined/Do not dispose.
    // frame contains final pixel data from the last frame; do nothing

    //Get existing pixels for img region after applying disposal method
    const imgData = this.frame.getImageData(
      img.leftPos,
      img.topPos,
      img.width,
      img.height
    )

    //apply color table colors
    img.pixels.forEach((pixel, i) => {
      // imgData.data === [R,G,B,A,R,G,B,A,...]
      if (pixel !== this.transparency) {
        imgData.data[i * 4 + 0] = ct[pixel][0]
        imgData.data[i * 4 + 1] = ct[pixel][1]
        imgData.data[i * 4 + 2] = ct[pixel][2]
        imgData.data[i * 4 + 3] = 255 // Opaque.
      }
    })

    this.frame.putImageData(imgData, img.leftPos, img.topPos)

    // We could use the on-page canvas directly, except that we draw a progress
    // bar for each image chunk (not just the final image).
    // if (drawWhileLoading) {
    //   ctx.drawImage(tmpCanvas, 0, 0)
    //   drawWhileLoading = options.auto_play
    // }
    this.lastImg = img
  }
  createHandle(): Handler {
    const withProgress = (fn: (block: any) => void) => {
      return (block: HandlerBlock) => {
        fn.call(this, block)
      }
    }
    return {
      hdr: withProgress(this.doHdr),
      gce: withProgress(this.doGCE),
      // I guess that's all for now.
      img: withProgress(this.doImg),
      com: withProgress(this.doNothing),
      app: {
        NETSCAPE: withProgress(this.doNothing),
      },
      eof: () => {
        this.pushFrame()
      }
    }
  }
}