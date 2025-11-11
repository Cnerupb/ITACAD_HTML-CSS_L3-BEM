import vituum from 'vituum'

export default {
  base: '/ITACAD_HTML-CSS_L3-BEM/',
  plugins: [
    vituum({
      imports: {
        filenamePattern: {
          '+.css': [],
          '+.scss': 'src/styles'
        }
      }
    })
  ]
}