import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      screens: {
        xs: "480px", // Custom 'xs' breakpoint
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1499px",
      },
    },
  },
  plugins: [],
} satisfies Config;

// module.exports = {
//   theme: {
//     extend: {
//       screens: {
//         xs: "480px", // Custom 'xs' breakpoint
//         sm: "640px",
//         md: "768px",
//         lg: "1024px",
//         xl: "1280px",
//         "2xl": "1536px",
//       },
//     },
//   },
// };
