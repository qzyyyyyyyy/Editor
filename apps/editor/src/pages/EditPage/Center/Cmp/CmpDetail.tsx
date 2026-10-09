import type { ReactElement } from 'react'

export function Text({ value }: { value: string }) {
  return <>{value}</>
}

export function Img({ value }: { value: string }) {
  return <img src={value} alt="" />
}

// ===== 图形（SVG）渲染 =====

interface ShapeProps {
  shape: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeStyle?: string
}

// borderStyle → SVG stroke-dasharray
const dashArrayMap: Record<string, string> = {
  solid: '',
  dashed: '8,4',
  dotted: '2,2',
}

interface RenderCtx {
  fill: string
  stroke: string
  strokeWidth: number
  dashArray: string
}

type ShapeRenderer = (ctx: RenderCtx) => ReactElement

// 统一 viewBox 0 0 100 100，外层 SVG 用 preserveAspectRatio="none"
// 使形状随容器宽高拉伸（与画布组件拉伸行为一致）
const shapeRenderers: Record<string, ShapeRenderer> = {
  rect: ({ fill, stroke, strokeWidth, dashArray }) => (
    <rect
      x="2"
      y="2"
      width="96"
      height="96"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  roundRect: ({ fill, stroke, strokeWidth, dashArray }) => (
    <rect
      x="2"
      y="2"
      width="96"
      height="96"
      rx="16"
      ry="16"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  circle: ({ fill, stroke, strokeWidth, dashArray }) => (
    <circle
      cx="50"
      cy="50"
      r="48"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  ellipse: ({ fill, stroke, strokeWidth, dashArray }) => (
    <ellipse
      cx="50"
      cy="50"
      rx="48"
      ry="38"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  triangle: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="50,6 96,94 4,94"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  rightTriangle: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="4,94 96,94 4,6"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  diamond: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="50,4 96,50 50,96 4,50"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  pentagon: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="50,4 96,38 78,96 22,96 4,38"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  hexagon: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="50,4 92,27 92,73 50,96 8,73 8,27"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  star: ({ fill, stroke, strokeWidth, dashArray }) => (
    <polygon
      points="50,4 61,38 96,38 68,60 79,94 50,74 21,94 32,60 4,38 39,38"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  heart: ({ fill, stroke, strokeWidth, dashArray }) => (
    <path
      d="M50,86 C18,58 4,42 4,26 C4,12 16,4 28,4 C38,4 46,10 50,18 C54,10 62,4 72,4 C84,4 96,12 96,26 C96,42 82,58 50,86 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  line: ({ stroke, strokeWidth, dashArray }) => (
    <line
      x1="4"
      y1="50"
      x2="96"
      y2="50"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
      strokeLinecap="round"
    />
  ),
  arrow: ({ stroke, strokeWidth, dashArray }) => (
    <path
      d="M6,50 L80,50 M80,50 L60,30 M80,50 L60,70"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  plus: ({ fill, stroke, strokeWidth, dashArray }) => (
    <path
      d="M45,6 L55,6 L55,45 L94,45 L94,55 L55,55 L55,94 L45,94 L45,55 L6,55 L6,45 L45,45 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
  cross: ({ fill, stroke, strokeWidth, dashArray }) => (
    <path
      d="M22,10 L50,38 L78,10 L90,22 L62,50 L90,78 L78,90 L50,62 L22,90 L10,78 L38,50 L10,22 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
    />
  ),
}

export function Shape({
  shape,
  fill = 'transparent',
  stroke = '#000',
  strokeWidth = 1,
  strokeStyle = 'solid',
}: ShapeProps) {
  const renderer = shapeRenderers[shape] || shapeRenderers.rect
  const dashArray = dashArrayMap[strokeStyle] ?? ''
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {renderer({ fill, stroke, strokeWidth, dashArray })}
    </svg>
  )
}
