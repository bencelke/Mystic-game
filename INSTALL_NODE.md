# Installing Node.js and Firebase Dependencies

## Step 1: Install Node.js

### Option A: Using Homebrew (Recommended for macOS)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

### Option B: Download from Official Website
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version for macOS
3. Run the installer
4. Verify installation in terminal

### Option C: Using Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

## Step 2: Install Firebase Dependencies

Once Node.js is installed, run these commands in your project directory:

```bash
# Install Firebase and Zod
npm install firebase zod

# Install dev dependencies
npm install -D @types/node

# Verify installation
npm list firebase zod
```

## Step 3: Restore Firebase Implementation

After installing dependencies, you can restore the full Firebase implementation by:

1. Uncomment the Firebase imports in all files
2. Remove the temporary placeholder implementations
3. Run `npm run build` to verify everything works

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. Convert your service account JSON to base64 and add to `FIREBASE_ADMIN_CREDENTIALS_B64`

## Troubleshooting

- If you get permission errors, try using `sudo` or fix npm permissions
- If Homebrew isn't working, try updating it: `brew update`
- For nvm issues, check the [nvm documentation](https://github.com/nvm-sh/nvm)

## Quick Test

After installation, test with:
```bash
npm run build
npm run dev
```

The build should now succeed without Firebase import errors!
