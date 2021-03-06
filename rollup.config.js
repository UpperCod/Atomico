import resolve from "@rollup/plugin-node-resolve";

export default {
    input: ["html/html.js"],
    output: [
        {
            dir: "./",
            format: "es",
        },
    ],
    plugins: [
        {
            name: "local",
            /**
             * prevents html from generating an additional chunk
             * that separates shared elements, thus depending
             * only on the core
             * @param {string} id
             */
            resolveId(id) {
                if ("../src/render.js" == id) {
                    return {
                        id: "./src/render.js",
                        external: true,
                    };
                }
            },
        },
        resolve(),
    ],
};
