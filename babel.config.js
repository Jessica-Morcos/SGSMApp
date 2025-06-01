module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        [
          "module-resolver",
          {
            root: ["./"],
            alias: {
              // “@” → the “src” folder
              "@": "./src",
            },
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
          },
        ],
      ],
    };
  };