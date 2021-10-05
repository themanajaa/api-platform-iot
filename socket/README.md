This sample code give the base for Zigbee communication experimentations

# Getting Started

* Copy .env.dist to .env file and edit with local parameters

* Configure a coordinator and router/enddevice with XCTU ([Download XCTU](https://www.digi.com/products/embedded-systems/digi-xbee/digi-xbee-tools/xctu#productsupport-utilities))

* Ensure your user is member of the `dialout` group on Linux (use the `id` command) and add user to group if not already done

    $sudo usermod -a -G dialout yourUserName

* Connect the coordinator to your computer and launch server.js with `yarn start`

# Configure Firebase
* https://firebase.google.com/docs/firestore/quickstart
* Create a file `serviceAccountKey.json` at the root folder
