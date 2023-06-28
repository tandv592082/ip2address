# IP TO ADDRESS

Extract address information from a list of IP addresses imported from an Excel file. It's free. Deploy server with zezo config.

<img src="https://raw.githubusercontent.com/tandv592082/ip2address/main/intro/Screenshot%202023-06-28%20at%2020.38.22.png" width="auto" height="auto"/>

👉 Demo link: [here](https://ip2address.vercel.app/)

## Features

- 🤝 IP is open for others to use: `https://ip2address.vercel.app/ip-to-location/:ip` where `ip` param is your ip.
- 📎 Export results to an Excel file.
- 📂 Extract a list of IP addresses from an Excel file.
- 🙉 View results directly on the interface.

## How to install

**Step 1:** Clone repository

```bash
git  https://github.com/tandv592082/ip2address.git
```

**Step 2:** Install dependencies

```bash
cd ip2address && npm install
```

**Step 3:** Run server

```bash
npm run dev
```

You can see page in: `http://localhost:8080`

## How to use

**Step 1:** Create an Excel file, name the sheet, and name the column that contains a list of IP addresses.

**Step 2:** Access the page `http://localhost:3000`, perform file upload, fill in the name of the sheet you just named (default name is Sheet1), and fill in the name of the column that contains the list of IP addresses in the corresponding fields.

**Step 3:** Press **`Analysis`** button.

## How to deploy

All detailed deployment documents to **Vercel** available [here](https://vercel.com/docs/concepts/deployments/git)
