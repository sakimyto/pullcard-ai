declare module '*.wasm' {
  const wasm: WebAssembly.Module
  export default wasm
}

declare module '*.ttf' {
  const data: ArrayBuffer
  export default data
}

declare module '*.woff2' {
  const data: ArrayBuffer
  export default data
}

declare module '*.png' {
  const data: ArrayBuffer
  export default data
}
