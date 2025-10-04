/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.css' {
  const css: string
  export default css
}

// Add PNG image module declarations
declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}