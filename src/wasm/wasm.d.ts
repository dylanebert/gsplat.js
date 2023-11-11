interface WasmModule {}

declare const loadWasm: () => Promise<WasmModule>;
export default loadWasm;
