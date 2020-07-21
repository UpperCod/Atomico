const { esbuildPlugin } = require("@web/dev-server-esbuild");

module.exports = {
    // this points to the root dir of your repository
    // in your project this is probably not needed
    rootDir: "../../..",
    nodeResolve: true,
    plugins: [
        esbuildPlugin({ jsx: true, jsxFactory: "h", jsxFragment: "Fragment" }),
    ],
};