# Health Today Care — Catálogo Clínico

Catálogo web estático de protocolos de sueroterapia funcional.

## Características

- HTML, CSS y JavaScript sin framework ni backend.
- Compatible con GitHub Pages.
- Diseño responsive para móvil, tablet y escritorio.
- Búsqueda por nombre y contenido del protocolo.
- Navegación mediante hash: cada protocolo tiene una URL compartible.
- Impresión de catálogo completo a PDF desde el navegador.
- Sin `onclick` inline ni dependencias externas obligatorias.
- Accesibilidad básica: foco visible, etiquetas, botones y navegación por teclado.

## Estructura

```text
health-today-care/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── protocols.js
├── assets/
│   └── logo.svg
├── .gitignore
└── README.md
```

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `health-today-care`.
2. Sube el contenido de esta carpeta a la rama `main`.
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona `main` y `/ (root)`.
6. Guarda y espera a que GitHub publique el sitio.

No se necesita Node.js, PHP, Python ni un servidor propio.

## Desarrollo local

Puedes abrir `index.html` directamente en un navegador moderno. Para una experiencia más consistente, también puedes usar cualquier servidor estático local.

## Contenido clínico

El catálogo es una interfaz de presentación. Las descripciones, indicaciones, componentes, dosis, contraindicaciones y claims terapéuticos deben ser validados por el profesional responsable y ajustarse a la normativa sanitaria aplicable antes de su publicación o uso comercial.

Este sitio no sustituye una valoración médica, diagnóstico ni prescripción.
