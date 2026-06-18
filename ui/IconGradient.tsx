import { SVGProps } from 'react'

export const IconGradient = () => (
  <defs>
    <linearGradient id="post-bridge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#7C3AED" />
      <stop offset="100%" stopColor="#00C2FF" />
    </linearGradient>
  </defs>
)

type Props = SVGProps<SVGSVGElement>

const svgProps: Props = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
}
export const DashboardIcon = () => (
  <svg {...svgProps}>
    <IconGradient />

    <path
      d="M5 18V12M12 18V6M19 18V9"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <circle cx="5" cy="10" r="2" fill="url(#post-bridge-gradient)" />
    <circle cx="12" cy="4" r="2" fill="url(#post-bridge-gradient)" />
    <circle cx="19" cy="7" r="2" fill="url(#post-bridge-gradient)" />
  </svg>
)

export const PlatformsIcon = () => (
  <svg {...svgProps}>
    <IconGradient />

    <path
      d="M12 6V18"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <path
      d="M6 12H18"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <circle cx="12" cy="12" r="2.5" fill="url(#post-bridge-gradient)" />

    <circle cx="12" cy="4" r="1.8" fill="url(#post-bridge-gradient)" />
    <circle cx="12" cy="20" r="1.8" fill="url(#post-bridge-gradient)" />
    <circle cx="4" cy="12" r="1.8" fill="url(#post-bridge-gradient)" />
    <circle cx="20" cy="12" r="1.8" fill="url(#post-bridge-gradient)" />
  </svg>
)

export const NewPostIcon = () => (
  <svg {...svgProps}>
    <IconGradient />

    <rect
      x="5"
      y="3"
      width="14"
      height="18"
      rx="3"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
    />

    <path
      d="M12 8V16M8 12H16"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const PostsIcon = () => (
  <svg {...svgProps}>
    <IconGradient />

    <rect
      x="6"
      y="5"
      width="12"
      height="13"
      rx="2"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
    />

    <rect
      x="4"
      y="8"
      width="12"
      height="13"
      rx="2"
      stroke="url(#post-bridge-gradient)"
      strokeWidth="2"
      opacity=".45"
    />
  </svg>
)
