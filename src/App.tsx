import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA, type CameraType } from './config/room'
import { PALETTE } from './config/palette'
import { DebugContext } from './components/scene/Block'
import { CameraRig, cameraProbe } from './components/scene/CameraRig'
import { Lights } from './components/scene/Lights'
import { Room } from './components/scene/Room'

const REFERENCE_IMAGE = `${import.meta.env.BASE_URL}refs/room-layout.png`

// Initial debug state can be set from the URL, e.g. ?overlay=0.5&camera=orthographic&edges=0&panel=0
const params = new URLSearchParams(window.location.search)
const initialOverlay = Number(params.get('overlay') ?? 0)

export default function App() {
  const [cameraType, setCameraType] = useState<CameraType>((params.get('camera') as CameraType) ?? CAMERA.defaultType)
  const [free, setFree] = useState(false)
  const [edges, setEdges] = useState(params.get('edges') !== '0')
  const [overlayOn, setOverlayOn] = useState(initialOverlay > 0)
  const [overlayOpacity, setOverlayOpacity] = useState(initialOverlay > 0 ? initialOverlay : 0.5)
  const [copied, setCopied] = useState('')
  const showPanel = params.get('panel') !== '0'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const key = e.key.toLowerCase()
      if (key === 'o') setOverlayOn((v) => !v)
      if (key === 'c') setCameraType((t) => (t === 'perspective' ? 'orthographic' : 'perspective'))
      if (key === 'e') setEdges((v) => !v)
      if (key === 'f') setFree((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copyCamera = async () => {
    const text = `position: [${cameraProbe.position.join(', ')}],\ntarget: [${cameraProbe.target.join(', ')}],`
    setCopied(text)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard may be unavailable; the values are still shown in the panel
    }
  }

  return (
    <div className="viewport">
      <div className="stage" style={{ background: PALETTE.wall }}>
        {/* flat = no tone mapping, so palette colors render as sampled from the reference */}
        <Canvas shadows flat gl={{ preserveDrawingBuffer: true }} resize={{ debounce: 0 }}>
          <DebugContext.Provider value={{ edges, free }}>
            <CameraRig type={cameraType} free={free} />
            <Lights />
            <Suspense fallback={null}>
              <Room />
            </Suspense>
          </DebugContext.Provider>
        </Canvas>
        {overlayOn && <img className="overlay" src={REFERENCE_IMAGE} style={{ opacity: overlayOpacity }} alt="" />}
      </div>

      {showPanel && (
        <aside className="panel">
          <strong>Stage 1 · 구조 & 구도</strong>
          <label>
            <input type="checkbox" checked={overlayOn} onChange={(e) => setOverlayOn(e.target.checked)} /> 참고 이미지 겹쳐보기 (O)
          </label>
          {overlayOn && (
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            />
          )}
          <label>
            <input
              type="checkbox"
              checked={cameraType === 'orthographic'}
              onChange={(e) => setCameraType(e.target.checked ? 'orthographic' : 'perspective')}
            />{' '}
            Orthographic 카메라 (C)
          </label>
          <label>
            <input type="checkbox" checked={edges} onChange={(e) => setEdges(e.target.checked)} /> 윤곽선 (E)
          </label>
          <label>
            <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> 자유 시점 (F)
          </label>
          {free && (
            <>
              <button onClick={copyCamera}>현재 카메라 값 복사</button>
              {copied && <pre>{copied}</pre>}
            </>
          )}
        </aside>
      )}
    </div>
  )
}
