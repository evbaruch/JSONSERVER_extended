# 📦 Installation Guide

This project sets up a custom JSON Server with a dynamic fallback that serves image metadata from a large file using an index. Follow the steps below to run it locally.

---

## 🔧 Requirements

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- `npm` (comes with Node.js)
- `train_urls.txt` – A file containing the image URLs, one per line
- `train_urls.index.json` – A JSON file mapping each line number to its byte offset in `train_urls.txt`

---

## 🚀 Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. **Install Dependencies**

```bash
npm install
```

3. **Verify Required Files Exist**

Make sure the following files exist in the root of the project:

- `train_urls.txt`
- `train_urls.index.json`
- `db.json` (can be an empty file or contain sample data)

> ❗ If `db.json` doesn’t exist, create an empty one:
>
> ```bash
> echo '{}' > db.json
> ```

4. **Start the Server**

```bash
npm run json:server
```

The server will run on: [http://localhost:3000](http://localhost:3000)

---

## 📖 API Usage

### Get static or dynamically generated items:

- **Static (from db.json):**
  `GET /pothos/:id` — if `id` exists in `db.json`

- **Dynamic fallback:**
  `GET /pothos/:id` — if `id` < `index.length` and not in db, a fake item with a real image URL will be returned

---

## 📁 Folder Structure

```
.
├── db.json
├── train_urls.txt
├── train_urls.index.json
├── server.js
├── package.json
├── .gitignore
└── node_modules/
```

---

## 🛠 Scripts

- `npm run json:server` — Starts the custom JSON server with fallback logic

---

## 📬 Need Help?

Feel free to open an issue or contact the maintainer for questions or contributions.
