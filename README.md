# EI Dungeon Web

> Status: Developing ⚠️

A Angular.js interface for the Ei Dungeon application. The project consists of a Role Playing Game (RPG) simulator with artificial players controlled by generative AI.

We also have a [API](https://github.com/wilknisoliveira/ei-dungeon-back) in development.

Do you want to know more about the project goals? Go to the 'Next steps' section.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Material](https://img.shields.io/badge/%20-Angular%20Material-blue?style=for-the-badge&logo=angular)

# Index

- <a href="#✔️-project-features">Project features</a>
- <a href="#🔨-how-to-install-this-project">Install</a>
- <a href="#🌐-internationalization">Internationalization</a>
- <a href="#👨‍💻-next-steps">Next steps</a>
- <a href="#author">Author</a>

# ✔️ Project features

- [x] Auth Guard with Role Based JWT
- [x] Login page
- [x] Side bar game list
- [x] Chat plays
- [x] Multilanguage (en, pt-BR, es)

# 🔨 How to install this project?

## Stack

First of all, make sure that you have the following technologies in your environment:

- Npm
- Angular CLI

## Git clone

```
# Clone this repository
$ git clone https://github.com/wilknisoliveira/ei-dungeon-web.git
```

## Run

Now you can start the application with the following commands:

```
npm install
ng serve
```

# 🌐 Internationalization

The application supports three languages: English, Portuguese (Brazil), and Spanish.

## Running a specific language

```
# English (default)
ng serve

# Portuguese (Brazil)
ng serve --configuration=pt-BR

# Spanish
ng serve --configuration=es
```

## Building for production (all languages)

```
ng build --configuration=production
```

This generates separate builds in `dist/ei-dungeon-web/browser/`:

| Directory | Language |
|-----------|----------|
| `en/` | English |
| `pt-BR/` | Portuguese |
| `es/` | Spanish |

## Testing all languages simultaneously

The production build requires a server with SPA fallback per locale. Use the included nginx setup:

```
# 1. Build for production
ng build --configuration=production

# 2. Start nginx (requires Docker)
cd nginx
docker-compose up -d
```

Then visit `http://localhost`:
- Root `/` redirects to your browser's detected language
- `/en/home` — English
- `/pt-BR/home` — Portuguese
- `/es/home` — Spanish

To stop nginx:

```
cd nginx
docker-compose down
```

# 👨‍💻 Next Steps

The long-term goal would be to scale the application so RPG lovers can create quick matches.

- [ ] Bug fixing
- [x] Logout
- [x] Delete game
- [ ] Keep user logged option
- [ ] Improve security
- [ ] Messages response by stream
- [ ] PremiumUser Enable Flow
- [ ] Admin page for tunning the AI responses and manage users
- [x] Multilanguage
- [x] Home page (public landing page at /)

# Author

Wilknis Deyvis

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wilknis/)
