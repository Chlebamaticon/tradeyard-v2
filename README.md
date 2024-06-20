# TradeyardV2

> How to run the app?

Please be sure that you've installed Node v20.10.0, or greater.

You will need to run docker container first, so execute the following command;

```sh
docker compose up -d
```

Once that's done; install all necessary packages by running `npm install --legacy-peer-deps` in root directory of this project.

Upon successfully packages installation you do need to build contract artifact using following command;

```
npm nx run ecommerce:hardhat compile
```

You should have already installed everything necessary to be able to run application locally by running `nx run-many --target=serve --all`.
