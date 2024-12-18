module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // Aviso para uso de `any`
    '@typescript-eslint/explicit-function-return-type': 'warn', // Aviso para tipos de retorno explícitos
    '@typescript-eslint/strict-boolean-expressions': 'warn', // Aviso para expressões booleanas
    '@typescript-eslint/no-unused-vars': 'warn', // Aviso para variáveis não utilizadas
    'no-console': 'warn', // Aviso para uso de `console.log`
    // 'comma-dangle': ['warn', 'always-multiline'], // Aviso para vírgulas no final de objetos/arrays multilinha
    quotes: ['warn', 'single'], // Aviso para uso de aspas simples
    semi: ['warn', 'never'], // Aviso para ponto e vírgula
    indent: ['warn', 2] // Aviso para indentação de 2 espaços
  }

}
