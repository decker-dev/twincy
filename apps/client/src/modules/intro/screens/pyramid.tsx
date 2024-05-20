"use client";

import {Canvas, GroupProps, useFrame} from "@react-three/fiber";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
  ToneMapping,
  ChromaticAberration,
  Scanline,
} from "@react-three/postprocessing";
import * as THREE from "three";
import {BlendFunction} from "postprocessing";
import {
  AccumulativeShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import {useLayoutEffect, useMemo, useRef, useState} from "react";

function PyramidScreen() {
  const deviceName = useMemo(
    () => new URLSearchParams(window.location.search).get("deviceName") || "Wave Link Stream",
    [],
  );
  const [analyser, setAnalyser] = useState<AnalyserNode>();

  useLayoutEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      const device = devices.find((device) => device.label.startsWith(deviceName))?.deviceId;

      if (!device) return;

      navigator.mediaDevices.getUserMedia({audio: {deviceId: device}}).then((str) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(str);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 32;
        source.connect(analyser);

        setAnalyser(analyser);
      });
    });
  }, [deviceName]);

  return (
    <Canvas
      shadows
      camera={{near: 0.01, far: 110, fov: 30}}
      gl={{
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        alpha: false,
        antialias: true,
        stencil: false,
        depth: true,
      }}
      style={{width: "100vw", height: "100vh"}}
    >
      <color args={["#1e1e1e"]} attach="background" />
      <fog attach="fog" color="#757bdb" far={40} near={5} />
      <Lights />
      <Prism analyser={analyser!} position={[0, -0.5, -15]} />
      <Effects />
    </Canvas>
  );
}

function Prism({analyser, ...props}: GroupProps & {analyser: AnalyserNode}) {
  const ref = useRef<THREE.Group>(null);
  const {nodes} = useGLTF("/xxpI-prism.glb");

  useFrame(() => {
    if (ref.current && analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);

      ref.current.position.z = THREE.MathUtils.lerp(
        ref.current.position.z,
        -30 + dataArray[1] / 10,
        0.075,
      );
    }
  });

  return (
    <group ref={ref} {...props}>
      <mesh
        dispose={null}
        geometry={(nodes as any).Cone.geometry}
        position={[0, 0, 0.6]}
        renderOrder={10}
        scale={2}
      >
        <MeshTransmissionMaterial
          toneMapped
          anisotropy={0}
          chromaticAberration={0}
          clearcoat={1}
          clearcoatRoughness={1}
          color="#191a2a"
          distortionScale={0}
          ior={0}
          roughness={0.25}
          temporalDistortion={0}
          transmission={0.25}
        />
      </mesh>
    </group>
  );
}

const Lights = () => {
  return (
    <>
      <ambientLight intensity={20} />
      <pointLight intensity={5} position={[10, -10, 0.5]} />
      <pointLight intensity={5} position={[0.5, -2, 0.5]} />
      <pointLight intensity={5} position={[-10, -20, 0.5]} />
      <spotLight angle={1} distance={7} intensity={10} penumbra={1} position={[0, -2, 1]} />
      <Environment resolution={32}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer
            intensity={10}
            position={[-5, -2, -10]}
            rotation-y={Math.PI / 2}
            scale={[10, 2, 1]}
          />
          <Lightformer
            intensity={20}
            position={[-5, -2, 10]}
            rotation-y={Math.PI / 2}
            scale={[10, 2, 1]}
          />
          <Lightformer
            intensity={1}
            position={[20, -2, 0.5]}
            rotation-y={-Math.PI / 2}
            scale={[20, 2, 1]}
          />
          <Lightformer
            intensity={2}
            position={[-0.1, -1, -5]}
            rotation-y={Math.PI / 2}
            scale={10}
            type="ring"
          />
        </group>
      </Environment>
      <AccumulativeShadows
        alphaTest={0.9}
        color="#000"
        colorBlend={5}
        frames={100}
        opacity={1}
        position={[0.5, 0.5, 0.5]}
        scale={30}
        toneMapped={true}
      >
        <RandomizedLight
          ambient={0.5}
          amount={4}
          bias={0.0001}
          intensity={1}
          mapSize={1024}
          position={[-0.5, 0.5, 0.5]}
          radius={10}
          size={15}
        />
      </AccumulativeShadows>
    </>
  );
};

const Effects = () => {
  return (
    <EffectComposer>
      <DepthOfField bokehScale={4} focalLength={1.4} />
      <Bloom height={500} intensity={0.2} luminanceSmoothing={0.25} luminanceThreshold={0.5} />
      <Bloom mipmapBlur intensity={0.5} levels={9} luminanceSmoothing={1} luminanceThreshold={1} />
      <Noise opacity={0.04} />
      <Vignette darkness={1} eskil={false} offset={0.1} />
      <ToneMapping maxLuminance={5} middleGrey={1} />
      <ChromaticAberration
        radialModulation
        blendFunction={BlendFunction.NORMAL}
        modulationOffset={0.3}
        offset={new THREE.Vector2(0.05, 0.05)}
      />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.3} />
    </EffectComposer>
  );
};

export default PyramidScreen;
