# 🏕️ Campamento Pokémon

Una aplicación web full-stack que combina un **Creador de Equipos Pokémon** y una **Tienda de Objetos**, con autenticación, roles de usuario y datos en tiempo real desde Firebase y PokéAPI.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss) ![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)

---

## 📋 Descripción

**Campamento Pokémon** es una SPA (Single Page Application) con temática de Pokédex que permite a los entrenadores:

- 🔍 **Explorar** la Pokédex completa (Gen I–IX + Formas/Megas) con un catálogo de más de 1300 criaturas y filtros por tipo y generación.
- ⚔️ **Construir y guardar** equipos de hasta 6 Pokémon vinculados a su cuenta.
- 🛒 **Comprar objetos** de una tienda gestionada por administradores, con sprites reales extraídos de las versiones oficiales.
- 🎒 **Ver su mochila** con todos los objetos adquiridos.
- 🛠️ **Administrar** el catálogo de la tienda (solo rol Admin), añadiendo objetos directamente descubiertos desde un buscador global.

Los datos de Pokémon se obtienen en tiempo real desde la [PokéAPI](https://pokeapi.co/) y los datos de usuario, catálogo propio y compras se almacenan de forma segura en **Firebase Firestore**.

---

## 🛠️ Stack tecnológico

### Framework y Core
| Librería | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | ^19.2.0 | Framework de UI |
| [React DOM](https://react.dev/) | ^19.2.0 | Renderizado en el DOM |
| [Vite](https://vitejs.dev/) | ^7.3.1 | Bundler y servidor de desarrollo |

### Routing y Estado
| Librería | Versión | Uso |
|---|---|---|
| [React Router DOM](https://reactrouter.com/) | ^7.13.1 | Navegación SPA e interceptores de rutas |
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.11 | Estado global (auth persistente, equipo en memoria local y tienda) |

### Formularios y Clases
| Librería | Versión | Uso |
|---|---|---|
| [React Hook Form](https://react-hook-form.com/) | ^7.71.2 | Gestión optimizada y validación de formularios |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 | Construcción de clases CSS condicionales |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.5.0 | Resolución de conflictos entre clases utilitarias de Tailwind |

### Estilos
| Librería | Versión | Uso |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.19 | Framework de utilidades CSS con variables de diseño personalizadas |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | ^10.4.27 | Prefijos CSS automáticos para compatibilidad |
| [PostCSS](https://postcss.org/) | ^8.5.8 | Procesamiento CSS subyacente |

### Backend y Servicios API
| Servicio | Uso |
|---|---|
| [Firebase Auth](https://firebase.google.com/products/auth) | Registro, login e inicio de sesión seguro |
| [Cloud Firestore](https://firebase.google.com/products/firestore) | Base de datos NoSQL para usuarios, estado de la tienda e inventario personal (mochila) |
| [PokéAPI](https://pokeapi.co/) | REST API pública. Origen de verdad para stats base, sprites, artwork y descripciones de ítems |

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

```
MIT License

Copyright (c) 2024-2025

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una
copia de este software, para usarlo, copiarlo, modificarlo, fusionarlo,
publicarlo, distribuirlo y/o venderlo, sujeto a las siguientes condiciones:

El aviso de copyright y este aviso de permiso deberán incluirse en todas
las copias o porciones sustanciales del Software.

EL SOFTWARE SE PROPORCIONA «TAL CUAL», SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O
IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN,
IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS
AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN,
DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O
CUALQUIER OTRO MOTIVO, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE O EL USO U
OTRO TIPO DE ACCIONES EN EL SOFTWARE.
```

---

## 🚀 Guía de instalación local

### Pre-requisitos

- **Node.js** 18 o superior
- Una cuenta de **Firebase** → [console.firebase.google.com](https://console.firebase.google.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/Campamento-Pokemon.git
cd Campamento-Pokemon
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Ve a la consola de Firebase y crea un nuevo proyecto web.
2. Activa **Authentication** con el proveedor *Email/Password*.
3. Activa **Firestore Database** comenzando en modo prueba.
4. En Firestore, asegúrate de colocar las siguientes Reglas de Seguridad básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Un usuario solo puede leer y escribir su propia información
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // La mochila (subcolección)
      match /ownedItems/{itemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /teams/{teamId} {
      allow read, write: if request.auth != null;
    }
    match /shopItems/{itemId} {
      // Todos pueden ver el catálogo, solo el admin puede escribir
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

5. Copia tus tokens del SDK de Firebase y reescribe completamente el archivo `src/services/firebase.js` o usa variables de entorno en un archivo `.env`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender
VITE_FIREBASE_APP_ID=tu_app_id
```

6. *(Opcional)* Para ser Admin, regístrate normalmente en la app, luego ve a la consola de Firestore, localiza tu documento dentro de la colección `users` y edita el campo `role` de `"trainer"` a `"admin"`.

### 4. Arrancar en local

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.
