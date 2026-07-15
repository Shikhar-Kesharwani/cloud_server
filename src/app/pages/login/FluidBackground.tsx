import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;

  // Simplex 3D Noise function
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    
    // Create organic movement using noise
    vec3 pos = position;
    float noiseFreq = 0.5;
    float noiseAmp = 0.8;
    vec3 noisePos = vec3(pos.x * noiseFreq + uTime * 0.1, pos.y * noiseFreq + uTime * 0.15, pos.z);
    
    pos.z += snoise(noisePos) * noiseAmp;
    
    // Add secondary micro-waves
    pos.z += sin(pos.x * 2.0 + uTime * 0.5) * 0.2;
    pos.z += cos(pos.y * 1.5 + uTime * 0.3) * 0.2;

    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  void main() {
    // Determine color based on z-height (peaks and valleys of the waves)
    // Normalize z position roughly between 0 and 1
    float depth = (vPosition.z + 1.0) / 2.0;
    
    // Add some flowing diagonal gradients based on UV
    float waveX = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
    float waveY = cos(vUv.y * 10.0 - uTime) * 0.5 + 0.5;
    
    // Mix the base colors
    vec3 color = mix(uColor1, uColor2, depth + waveX * 0.2);
    color = mix(color, uColor3, waveY * 0.5 + depth * 0.5);
    
    // Add subtle vignette/darkening at edges
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.2, dist);

    // Make it look metallic/glossy by enhancing highlights
    float highlight = pow(depth, 3.0) * 0.5;
    color += highlight;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function FluidBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  // Premium SaaS Colors: Deep Indigo, Electric Purple, Pitch Black
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#0f0c29') }, // Deep dark space blue
      uColor2: { value: new THREE.Color('#302b63') }, // Indigo
      uColor3: { value: new THREE.Color('#24243e') }, // Blackish purple
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.5;
    }
    // Slowly rotate the entire mesh for an extra subtle parallax effect
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} rotation={[-Math.PI / 4, 0, 0]}>
      {/* Plane that is much larger than the viewport so we can rotate it without seeing edges */}
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
}
