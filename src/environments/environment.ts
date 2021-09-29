// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  locales: ['en', 'vn'],
  defaultLocale: 'en',
  apiUrl: 'https://apitest.bettery.io',
  biconomy: "iwIgyW3sM.12ac582c-bd06-4289-8d48-47ef552af03f",
  maticUrl: "https://nd-425-039-881.p2pify.com/f97dd350631b1ab91bc9dc66c1cb158b",
  maticId: 80001,
  etherId: 5,
  torusNetwork: "testnet",
  torusVerifierId: "betteryAuth0",
  etherUrl: "https://goerli.infura.io/v3/d0c12cca9146439bbd961712ea1cab45",
  gasStationAPI: "https://gasstation-mumbai.matic.today",
  secretKey: "791351803491091234",
  demon: "54.255.226.141",
  // auth0_URI: "https://matic-network.d2f172wsk4mtv2.amplifyapp.com"
  auth0_URI: window.location.origin
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
