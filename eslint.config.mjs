// https://eslint.nuxt.com
import { withNuxt } from "./.nuxt/eslint.config.mjs"
import eslintConfigPrettier from "eslint-config-prettier"

// eslintConfigPrettier must be last so it can disable any stylistic ESLint
// rules that would otherwise conflict with Prettier's formatting.
export default withNuxt(eslintConfigPrettier)
