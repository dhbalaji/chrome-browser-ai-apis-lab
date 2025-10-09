import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";

export default {
  input: "hooks/index.ts",  // Your main entry file
  output: [
    {
      file: "dist/index.cjs.js",  // CommonJS output
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",  // ES module output
      format: "esm",
      sourcemap: true,
    },
  ],
  external: ["react"],  // Mark react as external peer dependency
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,  // Emit .d.ts per tsconfig.json
      clean: true,
    }),
    copy({
      targets: [
        { src: "package.json", dest: "dist" },
        // Add README.md or LICENSE as needed
      ],
      copyOnce: true,
    }),
  ],
};
