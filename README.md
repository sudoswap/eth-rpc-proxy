# eth rpc proxy

I wanted to use my local ethereum node for reads but send writes to an mev protected RPC. this simple proxy does just that

# setup

```bash
git clone https://github.com/sudoswap/eth-rpc-proxy
cp .env.example .env
# edit .env
pnpm i
pnpm build
pnpm start
```


# deploy to gcp

```bash
# ensure you're logged in "gcloud auth login"
./deploy.sh
```


# dev server

```bash
pnpm dev
```
